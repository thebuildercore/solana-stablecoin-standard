import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON webhook payloads
app.use(express.json());


// BOUNTY REQUIREMENT: Health Check Endpoint

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        service: 'sss-api',
        database: 'connected (mock)', //  will wire up Postgres next
        timestamp: new Date().toISOString() 
    });
});


// SSS-2 Compliance Webhook (Mocked for now)

app.post('/webhooks/seize', (req, res) => {
    const { targetAddress, reason } = req.body;
    console.log(` ALERT: Seizure requested for ${targetAddress}. Reason: ${reason}`);
    res.status(202).json({ message: "Seizure webhook received and processing." });
});

app.listen(port, () => {
    console.log(` SSS Compliance API running on port ${port}`);
});