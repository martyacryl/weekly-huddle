// Vercel serverless function wrapper for Express app
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Pool } = require('pg')

const app = express()

// Middleware
app.use(cors({
  origin: [
    'https://theweeklyhuddle.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Neon Database Connection
const connectionString = process.env.NEON_CONNECTION_STRING || 
  'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

// Test database connection on startup
pool.query('SELECT NOW()')
  .then(result => {
    console.log('✅ Database connection successful:', result.rows[0].now)
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error.message)
  })

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user by email
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = userResult.rows[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        isAdmin: user.is_admin 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.is_admin
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.userId,
      email: req.user.email,
      isAdmin: req.user.isAdmin
    }
  })
})

// Settings endpoints
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    // Get user settings from database
    const result = await pool.query(
      'SELECT settings FROM user_settings WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      // Return default settings if none exist
      const defaultSettings = {
        calendar: {
          icalUrl: '',
          googleCalendarEnabled: false,
          syncFrequency: 'realtime'
        },
        weather: {
          enabled: false,
          location: '',
          units: 'imperial'
        },
        notifications: {
          enabled: true,
          email: true,
          push: false
        }
      }
      return res.json(defaultSettings)
    }

    res.json(result.rows[0].settings)
  } catch (error) {
    console.error('Settings fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const settings = req.body

    // Upsert user settings
    await pool.query(
      `INSERT INTO user_settings (user_id, settings) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id) 
       DO UPDATE SET settings = $2, updated_at = NOW()`,
      [userId, JSON.stringify(settings)]
    )

    res.json({ success: true })
  } catch (error) {
    console.error('Settings save error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Goals endpoints
app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    // Get user goals from database
    const result = await pool.query(
      'SELECT goals FROM user_goals WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return res.json([])
    }

    res.json(result.rows[0].goals)
  } catch (error) {
    console.error('Goals fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Marriage weeks endpoints
app.get('/api/marriage-weeks/:weekKey', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const weekKey = req.params.weekKey

    // Get marriage week data
    const result = await pool.query(
      'SELECT * FROM marriage_weeks WHERE user_id = $1 AND week_key = $2',
      [userId, weekKey]
    )

    if (result.rows.length === 0) {
      return res.json({
        weekKey,
        schedule: {},
        todos: [],
        notes: '',
        goals: [],
        encouragement: []
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Marriage week fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Calendar proxy endpoint
app.get('/api/calendar-proxy', async (req, res) => {
  try {
    const { url } = req.query

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' })
    }

    // Fetch calendar data from the provided URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WeeklyHuddle/1.0)',
        'Accept': 'text/calendar, application/calendar+json, */*'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.text()
    res.set('Content-Type', 'text/calendar')
    res.send(data)
  } catch (error) {
    console.error('Calendar proxy error:', error)
    res.status(500).json({ error: 'Failed to fetch calendar data' })
  }
})

// Export the Express app for Vercel
module.exports = app
