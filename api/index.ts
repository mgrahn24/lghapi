const express = require("express");
const app = express();
const sb_url = "https://cnpnidbcxnstzfzqagyl.supabase.co"
const sb_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucG5pZGJjeG5zdHpmenFhZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTcyNzYwMjQsImV4cCI6MjAzMjg1MjAyNH0.mNc3bCvF6V3BEoY59U73f9uyjh1J9DjPOcLrxJ3mPHc"


import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient(sb_url, sb_key)


app.get("/", async (req, res) => {
    let { data: Address, error } = await supabase
        .from('Address')
        .select('*')
    res.send(JSON.stringify(Address))
}
);

app.get('/apartment/:id', async (req, res) => {
    const apartment_id = req.params.id;

    try {
        // Query the apartment by ID
        const { data: apartmentData, error: apartmentError } = await supabase
            .from('Apartment')
            .select('*')
            .eq('apartment_id', apartment_id)
            .single();

        if (apartmentError) {
            return res.status(400).json({ error: apartmentError.message });
        }

        if (!apartmentData) {
            return res.status(404).json({ message: 'Apartment not found' });
        }

        // Query occupants by apartment ID
        const { data: occupantsData, error: occupantsError } = await supabase
            .from('Occupant')
            .select('*')
            .eq('apartment_id', apartment_id);

        if (occupantsError) {
            return res.status(400).json({ error: occupantsError.message });
        }

        // Query address by address ID
        const { data: addressData, error: addressError } = await supabase
            .from('Address')
            .select('*')
            .eq('address_id', apartmentData.apartment_id);

        if (addressError) {
            return res.status(400).json({ error: addressError.message });
        }

        // Combine the apartment data and occupants data
        apartmentData.address = addressData[0].address
        apartmentData.suburb = addressData[0].suburb
        apartmentData.occupants = occupantsData

        const response = apartmentData

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to get all apartments by building ID
app.get('/address/:address_id/apartments', async (req, res) => {
    const address_id = req.params.address_id;
  
    try {
      // Query apartments by building ID
      const { data, error } = await supabase
        .from('Apartment')
        .select('*')
        .eq('address_id', address_id);
  
      if (error) {
        return res.status(400).json({ error: error.message });
      }
  
      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'No apartments found for this building' });
      }
  
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

app.listen(3001, () => console.log("Server ready on port 3001."));

module.exports = app;