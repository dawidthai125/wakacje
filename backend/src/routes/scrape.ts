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
    
    let title = '';
    let price = 0;
    let hotelRating = 3;
    let foodConfig = 'Nie określono';
    let destination = '';

    // --- Specyficzna logika dla WAKACJE.PL ---
    if (url.includes('wakacje.pl')) {
      // Tytuł hotelu
      title = $('h1[data-testid="hotel-name"]').text().trim() || 
              $('.hotel-name').text().trim() || 
              $('h1').first().text().trim();

      // Cena (często ukryta w atrybutach lub specyficznych klasach)
      const priceVal = $('[data-testid="price-value"]').text().replace(/[^\d]/g, '') || 
                       $('.price-value').text().replace(/[^\d]/g, '');
      if (priceVal) price = parseFloat(priceVal);

      // Gwiazdki
      const stars = $('.stars').find('.icon-star').length || 
                    $('[data-testid="hotel-stars"]').text().replace(/[^\d]/g, '');
      if (stars) hotelRating = parseInt(stars.toString());

      // Cel i Wyżywienie
      destination = $('[data-testid="breadcrumb-item"]').last().prev().text().trim();
      foodConfig = $('[data-testid="offer-details-service"]').text().trim() || 'All Inclusive';
    } 
    // --- Specyficzna logika dla ITAKA ---
    else if (url.includes('itaka.pl')) {
      title = $('.hotel-name').text().trim();
      const p = $('.price').text().replace(/[^\d]/g, '');
      if (p) price = parseFloat(p);
      destination = $('.destination').text().trim();
    }
    
    // Fallback dla tytułu jeśli specyficzne zawiodły
    if (!title) {
      title = $('title').text().trim();
      if (title.includes('|')) title = title.split('|')[0].trim();
      if (title.includes('-')) title = title.split('-')[0].trim();
    }

    // Fallback dla ceny (JSON-LD)
    if (price === 0) {
      const jsonLd = $('script[type="application/ld+json"]');
      jsonLd.each((_, el) => {
        try {
          const data = JSON.parse($(el).html() || '{}');
          if (data.offers && data.offers.price) {
            price = parseFloat(data.offers.price);
          } else if (data['@type'] === 'Product' && data.offers && data.offers.lowPrice) {
            price = parseFloat(data.offers.lowPrice);
          }
        } catch (e) {}
      });
    }

    // Ostateczny fallback ceny (regex)
    if (price === 0) {
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
      hotelRating: hotelRating,
      foodConfig: foodConfig,
      destination: destination,
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
