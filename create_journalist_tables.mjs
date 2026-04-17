import { createConnection } from 'mysql2/promise';

const conn = await createConnection(process.env.DATABASE_URL);

console.log('Creazione tabella journalists...');
await conn.execute(`
  CREATE TABLE IF NOT EXISTS \`journalists\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`username\` varchar(64) NOT NULL,
    \`email\` varchar(320) NOT NULL,
    \`passwordHash\` varchar(255) NOT NULL,
    \`displayName\` varchar(255) NOT NULL,
    \`bio\` text,
    \`avatarUrl\` varchar(1000),
    \`linkedinUrl\` varchar(500),
    \`journalistKey\` varchar(64) NOT NULL,
    \`isActive\` boolean NOT NULL DEFAULT true,
    \`sessionToken\` varchar(255),
    \`sessionExpiresAt\` timestamp NULL,
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    \`lastLoginAt\` timestamp NULL,
    \`totalArticles\` int NOT NULL DEFAULT 0,
    \`avgTrustScore\` float,
    CONSTRAINT \`journalists_id\` PRIMARY KEY(\`id\`),
    CONSTRAINT \`journalists_username_unique\` UNIQUE(\`username\`),
    CONSTRAINT \`journalists_email_unique\` UNIQUE(\`email\`),
    CONSTRAINT \`journalists_journalistKey_unique\` UNIQUE(\`journalistKey\`),
    CONSTRAINT \`journalists_sessionToken_unique\` UNIQUE(\`sessionToken\`)
  )
`);
console.log('Tabella journalists creata.');

console.log('Creazione tabella journalist_articles...');
await conn.execute(`
  CREATE TABLE IF NOT EXISTS \`journalist_articles\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`journalistId\` int NOT NULL,
    \`title\` varchar(500) NOT NULL,
    \`body\` mediumtext NOT NULL,
    \`summary\` text,
    \`category\` varchar(100) NOT NULL,
    \`imageUrl\` varchar(1000),
    \`status\` enum('draft','review','published','rejected') NOT NULL DEFAULT 'draft',
    \`verifyHash\` varchar(64),
    \`verifyBadge\` varchar(32),
    \`verifyReport\` json,
    \`trustScore\` float,
    \`trustGrade\` varchar(1),
    \`publishedAt\` timestamp NULL,
    \`newsItemId\` int,
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT \`journalist_articles_id\` PRIMARY KEY(\`id\`),
    CONSTRAINT \`journalist_articles_journalistId_fk\` FOREIGN KEY (\`journalistId\`) REFERENCES \`journalists\`(\`id\`)
  )
`);
console.log('Tabella journalist_articles creata.');

await conn.execute(`CREATE INDEX IF NOT EXISTS \`idx_ja_journalist\` ON \`journalist_articles\` (\`journalistId\`)`).catch(() => {});
await conn.execute(`CREATE INDEX IF NOT EXISTS \`idx_ja_status\` ON \`journalist_articles\` (\`status\`)`).catch(() => {});

const [tables] = await conn.execute("SHOW TABLES LIKE 'journalist%'");
console.log('Tabelle create:', JSON.stringify(tables));

await conn.end();
console.log('Done!');
