const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models');
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir);
}

const models = {
    'Department': `const mongoose = require('mongoose');
const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },
  code: { type: String, unique: true, sparse: true },
  description: String
}, { timestamps: true });
module.exports = mongoose.model('Department', DepartmentSchema);`,

    'Program': `const mongoose = require('mongoose');
const ProgramSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  name: { type: String, required: true },
  code: String,
  duration_years: Number
}, { timestamps: true });
module.exports = mongoose.model('Program', ProgramSchema);`,

    'Semester': `const mongoose = require('mongoose');
const SemesterSchema = new mongoose.Schema({
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  semester_number: { type: Number, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Semester', SemesterSchema);`,

    'FriendRequest': `const mongoose = require('mongoose');
const FriendRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'blocked'], default: 'pending' }
}, { timestamps: true });
module.exports = mongoose.model('FriendRequest', FriendRequestSchema);`,

    'GlobalMessage': `const mongoose = require('mongoose');
const GlobalMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('GlobalMessage', GlobalMessageSchema);`,

    'DirectMessage': `const mongoose = require('mongoose');
const DirectMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('DirectMessage', DirectMessageSchema);`,

    'Resource': `const mongoose = require('mongoose');
const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  resource_type: { type: String, enum: ['notes', 'ppt', 'pdf', 'syllabus', 'previous_paper', 'other'], required: true },
  file_url: { type: String, required: true },
  file_name: { type: String, required: true },
  file_size_bytes: Number,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
  subject_name: String,
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });
module.exports = mongoose.model('Resource', ResourceSchema);`,

    'Club': `const mongoose = require('mongoose');
const ClubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: String,
  logo_url: String,
  contact_email: String,
  instagram_url: String,
  is_recruiting: { type: Boolean, default: false },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['member', 'coordinator', 'lead'], default: 'member' },
    joined_at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
module.exports = mongoose.model('Club', ClubSchema);`,

    'ClubMessage': `const mongoose = require('mongoose');
const ClubMessageSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('ClubMessage', ClubMessageSchema);`,

    'Event': `const mongoose = require('mongoose');
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
module.exports = mongoose.model('Event', EventSchema);`,

    'Team': `const mongoose = require('mongoose');
const TeamSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  description: String,
  required_skills: [String],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  is_open: { type: Boolean, default: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['leader', 'member'], default: 'member' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    joined_at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
module.exports = mongoose.model('Team', TeamSchema);`,

    'ExperiencePost': `const mongoose = require('mongoose');
const ExperiencePostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  is_published: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('ExperiencePost', ExperiencePostSchema);`,

    'PostComment': `const mongoose = require('mongoose');
const PostCommentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'ExperiencePost', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('PostComment', PostCommentSchema);`,
};

for (const [name, content] of Object.entries(models)) {
    fs.writeFileSync(path.join(modelsDir, name + '.js'), content);
}
console.log('Models generated successfully!');
