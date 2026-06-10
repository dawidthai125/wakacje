import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

router.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });

    const $ = cheerio.load(response.data);
    
    // Prosty parser dla tytułu i ceny (można rozbudować o selektory specyficzne dla stron)
    let title = $('title').text().trim();
    if (title.includes('|')) title = title.split('|')[0].trim();
    
    // Próba znalezienia ceny w metatagach lub tekście
    let price = 0;
    const priceText = $('meta[property="product:price:amount"]').attr('content') || 
                     $('meta[name="price"]').attr('content');
    
    if (priceText) {
      price = parseFloat(priceText);
    } else {
      // Szukanie wzorca ceny w tekście (bardzo uproszczone)
      const bodyText = $('body').text();
      const priceMatch = bodyText.match(/(\d+[\s,]\d{3}|\d+)\s?(PLN|zł)/i);
      if (priceMatch) {
        price = parseFloat(priceMatch[1].replace(/\s/g, '').replace(',', '.'));
      }
    }

    res.json({
      title: title || 'Nie udało się pobrać tytułu',
      price: price || 0,
      url: url,
      platform: url.includes('wakacje.pl') ? 'wakacje.pl' : 
                url.includes('itaka.pl') ? 'Itaka' : 
                url.includes('tui.pl') ? 'TUI' : 
                url.includes('travelplanet.pl') ? 'travelplanet.pl' : 'Inna'
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Nie udało się pobrać danych z tego linku. Serwis może blokować automatyczne zapytania.' });
  }
});

export default router;
