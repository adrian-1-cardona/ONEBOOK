# ONEBOOK

## Unified Checkout - Global Routes System

A static HTML/CSS/JS checkout application featuring **45 major routes across the entire world**.

### Available Cities & Routes

The application includes transport routes connecting major cities across all continents:

#### **North America**
- New York, Boston, Philadelphia, Washington DC
- Chicago, Detroit, Denver, Salt Lake City
- San Francisco, Los Angeles, San Diego
- Seattle, Portland, Austin, Dallas
- Miami, Toronto, Montreal, Vancouver

#### **Europe**
- London, Paris, Amsterdam, Berlin, Prague
- Madrid, Barcelona, Rome, Milan, Vienna
- Budapest, Geneva, Zurich, Athens, Thessaloniki
- Stockholm, Copenhagen, Istanbul, Ankara, Lisbon, Porto
- Moscow, St. Petersburg, Cairo, Alexandria

#### **Asia-Pacific**
- Tokyo, Osaka, Kyoto, Shanghai, Beijing, Hangzhou
- Hong Kong, Guangzhou, Bangkok, Chiang Mai, Ho Chi Minh City
- Singapore, Kuala Lumpur, Seoul, Busan, Mumbai, Delhi

#### **Africa & Middle East**
- Dubai, Abu Dhabi, Cairo, Alexandria
- Cape Town, Johannesburg, Pretoria

#### **South America**
- Rio de Janeiro, São Paulo, Mexico City, Guadalajara
- Buenos Aires, Mendoza

### Features

- **45 Global Routes** with realistic operators and pricing
- **Dynamic City Selection** - origin and destination dropdowns update based on available routes
- **Shopping Cart** - add multiple routes and checkout
- **Persistent Storage** - uses localStorage for cart and customer data
- **No Backend Required** - completely static with dynamic data loading
- **Responsive Design** - works on mobile and desktop

### Data Structure

Routes are stored in `unified-checkout/public/data/routes.json` with details including:
- Route ID, origin, destination, country
- Date, time, duration, price
- Operator information
- Journey legs with transport details
