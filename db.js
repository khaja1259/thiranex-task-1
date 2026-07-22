const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// 1. Initialize Sequelize Connection
// By default, this connects to a zero-configuration SQLite local database file.
// To switch to MySQL or PostgreSQL, change the dialect and specify connection options or a URI.
const DB_DIALECT = process.env.DB_DIALECT || 'sqlite';

let sequelize;
if (DB_DIALECT === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false
  });
} else {
  // Example configuration for MySQL/PostgreSQL:
  // sequelize = new Sequelize(process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/portfolio', {
  //   dialect: DB_DIALECT, // 'mysql' or 'postgres'
  //   logging: false
  // });
  console.log(`Configuring Sequelize for ${DB_DIALECT} connection.`);
}

// 2. Define Project Model
const Project = sequelize.define('Project', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  technology: {
    type: DataTypes.STRING,
    allowNull: false
  },
  projectUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  githubUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// 3. Define Skill Model
const Skill = sequelize.define('Skill', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false // e.g. 'Expert', 'Intermediate', 'Beginner'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false // e.g. 'Programming Languages', 'Web Technologies'
  }
});

// 4. Define Contact Message Model (for Comments)
const Message = sequelize.define('Message', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

/**
 * Syncs models with the database tables and populates seed data if empty.
 */
async function syncAndSeedDatabase() {
  try {
    await sequelize.authenticate();
    console.log('📡 Database connection established successfully.');

    // Sync schema to SQLite database file
    await sequelize.sync();

    // Seed default projects if none exist
    const projectCount = await Project.count();
    if (projectCount === 0) {
      await Project.bulkCreate([
        {
          title: 'My Portfolio Website',
          description: 'A premium full-stack personal portfolio showcasing skills, projects, and a visitor comments board using a Node/Express backend and Sequelize database.',
          technology: 'Web Development',
          projectUrl: 'http://localhost:3000',
          githubUrl: 'https://github.com/naserudden/portfolio'
        },
        {
          title: 'Password Generator',
          description: 'A customizable Python script that generates strong, randomized passwords based on user criteria (length, digits, special characters) to promote cybersecurity.',
          technology: 'Python',
          projectUrl: null,
          githubUrl: 'https://github.com/naserudden/password-generator'
        },
        {
          title: 'Simple Calculator',
          description: 'An interactive Java desktop application that executes arithmetic calculations. Focuses on OOP concepts, layout configurations, and robust user error handling.',
          technology: 'Java',
          projectUrl: null,
          githubUrl: 'https://github.com/naserudden/simple-calculator'
        }
      ]);
      console.log('🌱 Seeded default projects into database.');
    }

    // Seed default skills if none exist
    const skillCount = await Skill.count();
    if (skillCount === 0) {
      await Skill.bulkCreate([
        { name: 'Java', level: 'Expert', category: 'Programming Languages' },
        { name: 'Web Development', level: 'Expert', category: 'Web Technologies' },
        { name: 'Python', level: 'Intermediate', category: 'Programming Languages' },
        { name: 'Problem Solving', level: 'Expert', category: 'General' }
      ]);
      console.log('🌱 Seeded default skills into database.');
    }
  } catch (err) {
    console.error('❌ Database Sync/Seed Error:', err);
  }
}

module.exports = {
  sequelize,
  Project,
  Skill,
  Message,
  syncAndSeedDatabase
};
