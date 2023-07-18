const express = require('express');
const path = require('path');
const sql = require('mssql');

const config = {
  server: 'EMMY',
  database: 'prime',
  user: 'sa',
  password: 'emmy',
  options: {
    trustServerCertificate: true,
  },
};

const pool = new sql.ConnectionPool(config);

async function connect() {
  try {
    if (!pool.connected) {
      await pool.connect();
      console.log('Connected to SQL Server');
    }
  } catch (error) {
    console.error('Failed to connect to SQL Server:', error.message);
  }
}

const app = express();
const port = 3000;

app.use(express.static('life'));
app.use(express.urlencoded({ extended: true }));

app.get('/data', async (req, res) => {
  try {
    const categoryType = req.query.categoryType;

    await connect();

    const query = `
      SELECT PolicyholderSumInsured, SpouseSumInsured, KidsSumInsured, ParentSumInsured, FuneralAmount, HospitalAmount, DriverEmergencyAmount
      FROM family_insurance
      WHERE CategoryType LIKE '%' + @categoryType + '%'
    `;

    const result = await pool.request()
      .input('categoryType', sql.NVarChar, categoryType)
      .query(query);

    if (!result.recordset || result.recordset.length === 0) {
      res.json({ error: 'No data found for the selected category type.' });
      return;
    }

    const data = result.recordset[0];
    res.json(data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
});

app.get('/additionalData', async (req, res) => {
  try {
    const categoryType = req.query.categoryType;

    await connect();

    const query = `
      SELECT MonthlyPremium, AnnualyPremium, MonthlyMinSavings, AnnualyMinSavings, MonthlyAddPremium, AnnualyAddPremium, MonthlyAddPmParent, BaseKids
      FROM family_insurance
      WHERE CategoryType LIKE '%' + @categoryType + '%'
    `;


    const result = await pool.request()
      .input('categoryType', sql.NVarChar, categoryType)
      .query(query);

    if (!result.recordset || result.recordset.length === 0) {
      res.json({ error: 'No additional data found for the selected category type.' });
      return;
    }

    const additionalData = result.recordset[0];
    res.json(additionalData);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching additional data.' });
  }
});

app.get('/categoryTypes', async (req, res) => {
  try {
    await connect();

    const query = `
      SELECT DISTINCT CategoryType
      FROM family_insurance
    `;

    const result = await pool.request().query(query);

    if (!result.recordset || result.recordset.length === 0) {
      res.json({ error: 'No category types found.' });
      return;
    }

    const categoryTypes = result.recordset.map(record => record.CategoryType);
    res.json(categoryTypes);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching category types.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'life', 'index.html'));
});

app.listen(port, () => {
  connect().catch(console.error);
  console.log(`Server is running on http://localhost:${port}`);
});



