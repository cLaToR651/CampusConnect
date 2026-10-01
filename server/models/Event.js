const mongoose = require('mongoose');
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  event_type: { type: String, enum: ['workshop', 'hackathon', 'competition', 'seminar', 'cultural', 'sports', 'other'], default: 'other' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venue: String,
  starts_at: { type: Date, required: true },
  ends_at: Date,
  registration_url: String,
  registration_deadline: Date,
  requires_team: { type: Boolean, default: false },
  min_team_size: Number,
  max_team_size: Number,
  status: { type: String, enum: ['draft', 'published', 'cancelled', 'completed'], default: 'draft' },
  registrations: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['registered', 'waitlisted', 'cancelled'], default: 'registered' },
    registered_at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
module.exports = mongoose.model('Event', EventSchema);