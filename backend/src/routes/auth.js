const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const Question = require('../models/Question');
const User = require('../models/User');
const Vote = require('../models/Vote')

const router = express.Router();

// Passport configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    // Check if the user already exists
    let user = await findOne({ googleId: profile.id });
    if (user) {
        done(null, user);
    } else {
        // If not, create a new user
        user = new User({
            googleId: profile.id,
            username: ''  // We'll set this after login
        });
        await user.save();
        done(null, user);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    findById(id, (err, user) => done(err, user));
});

// Routes
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Redirect to a page where user can choose a username
        res.redirect('/set-username');
    }
);

// Get today's question
router.get('/question/today', async (req, res) => {
    try {
        const today = moment().tz('Europe/London').startOf('day').toDate();
        const todayQuestion = await Question.findOne({ dateAsked: today });

        if (todayQuestion) {
            res.json(todayQuestion);
        } else {
            res.status(404).json({ message: 'No question has been selected for today yet.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch today\'s question' });
    }
});
// Route to create a new question
router.post('/create-question', async (req, res) => {
    try {
        const { questionText, leadingQuestion, caption } = req.body;
        const newQuestion = new Question({
            questionText,
            leadingQuestion,
            caption
        });
        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create question' });
    }
});

// Submit a vote
router.post('/vote', async (req, res) => {
    try {
        const { userId, questionId, vote } = req.body;

        // Ensure the user hasn't already voted for this question
        const existingVote = await Vote.findOne({ userId, questionId });
        if (existingVote) {
            return res.status(400).json({ error: 'User has already voted for this question' });
        }

        const newVote = new Vote({
            userId,
            questionId,
            vote
        });

        await newVote.save();

        // Update the vote count on the question
        if (vote === 'Normal') {
            await Question.findByIdAndUpdate(questionId, { $inc: { votesNormal: 1 } });
        } else {
            await Question.findByIdAndUpdate(questionId, { $inc: { votesOther: 1 } });
        }

        res.status(201).json(newVote);
    } catch (err) {
        res.status(500).json({ error: 'Failed to submit vote' });
    }
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
