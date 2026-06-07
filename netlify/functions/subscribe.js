// ── MailerLite Subscribe Function ─────────────────────────────────────────────
// Receives diagnostic data from the browser, adds subscriber to MailerLite.
// API key is stored in Netlify environment variables — never in client code.

const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api';
const GROUP_ID = '89629665447512052';

exports.handler = async function(event, context) {

// Only allow POST requests
if (event.httpMethod !== 'POST') {
return {
statusCode: 405,
body: JSON.stringify({ error: 'Method not allowed' })
};
}

// Parse the incoming data from the diagnostic
let data;
try {
data = JSON.parse(event.body);
} catch (e) {
return {
statusCode: 400,
body: JSON.stringify({ error: 'Invalid JSON' })
};
}

const {
email,
firstName,
lastName,
career_stage,
css_score,
archetype,
job_level,
years_exp,
target_role
} = data;

// Validate required fields
if (!email || !firstName) {
return {
statusCode: 400,
body: JSON.stringify({ error: 'Email and first name are required' })
};
}

// Build the MailerLite subscriber payload
const payload = {
email: email,
fields: {
name: firstName,
last_name: lastName || '',
career_stage: career_stage || '',
css_score: String(css_score || ''),
archetype: archetype || '',
job_level: job_level || '',
years_exp: years_exp || '',
target_role: target_role || ''
},
groups: [GROUP_ID],
status: 'active'
};

try {
const response = await fetch(`${MAILERLITE_API_URL}/subscribers`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Accept': 'application/json',
'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
},
body: JSON.stringify(payload)
});

const result = await response.json();

// 200 = updated existing subscriber, 201 = new subscriber created
if (response.ok) {
return {
statusCode: 200,
headers: {
'Access-Control-Allow-Origin': '*'
},
body: JSON.stringify({
success: true,
message: 'Subscriber added successfully',
id: result.data?.id || null
})
};
}

// MailerLite returned an error
console.error('MailerLite error:', JSON.stringify(result));
return {
statusCode: response.status,
headers: {
'Access-Control-Allow-Origin': '*'
},
body: JSON.stringify({
success: false,
error: result.message || 'MailerLite API error'
})
};

} catch (err) {
console.error('Function error:', err.message);
return {
statusCode: 500,
headers: {
'Access-Control-Allow-Origin': '*'
},
body: JSON.stringify({
success: false,
error: 'Internal server error'
})
};
}
};
