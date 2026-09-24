import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

const RAPIDAPI_KEY = "165e4b751fmshe768d6e2aa1ad9ap197c0bjsn4c18dc77482b";
const RAPIDAPI_HOST = 'weather-api167.p.rapidapi.com';
const BASE_PATH = '/api/weather/forecast';

app.use(express.static("public"));
/*
|--------------------------------------------------------------------------
| Weather API Function
|--------------------------------------------------------------------------
| Supports:
|   1. City name
|   2. Latitude + Longitude
*/
async function getWeather({
    city,
    lat,
    lon,
    cnt = 3,
    units = 'standard',
    lang = 'en'
}) {
    if (!RAPIDAPI_KEY) {
        throw new Error('RAPIDAPI_KEY is not configured.');
    }

    const params = new URLSearchParams({
        lang,
        units,
        cnt: String(cnt),
        mode: 'json',
        type: 'three_hour'
    });

    // Search by city
    if (city) {
        params.set('place', `${city},IN`);
    }

    // Search by coordinates
    if (lat !== undefined && lon !== undefined) {
        params.set('lat', String(lat));
        params.set('lon', String(lon));
    }

    const url =
        `https://${RAPIDAPI_HOST}${BASE_PATH}?${params.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        }
    });

    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch {
        data = {
            raw: text
        };
    }

    if (!response.ok) {
        const error = new Error(
            `Weather API returned ${response.status}`
        );

        error.status = response.status;
        error.details = data;

        throw error;
    }

    return data;
}


/*
|--------------------------------------------------------------------------
| HOME
|--------------------------------------------------------------------------
*/

app.get('/', (req, res) => {

    res.json({
        message: 'Weather Forecast API',

        routes: {
            city:
                '/weather/city/:city',

            coordinates:
                '/weather/coordinates?lat=22.3039&lon=70.8022',

            queryCity:
                '/weather?city=Rajkot',

            queryCoordinates:
                '/weather?lat=22.3039&lon=70.8022'
        }
    });

});


/*
|--------------------------------------------------------------------------
| WEATHER BY CITY
|--------------------------------------------------------------------------
|
| Example:
|
| GET /weather/city/Rajkot
| GET /weather/city/Ahmedabad
| GET /weather/city/Surat
|
*/

app.get('/weather/city/:city', async (req, res) => {

    try {

        const city = req.params.city.trim();

        if (!city) {
            return res.status(400).json({
                success: false,
                message: 'City name is required.'
            });
        }

        const data = await getWeather({
            city: city
        });

        res.json({
            success: true,
            searchType: 'city',
            city: city,
            data: data
        });

    } catch (error) {

        console.error(error);

        res.status(error.status || 500).json({
            success: false,
            message: error.message,
            details: error.details || null
        });

    }

});


/*
|--------------------------------------------------------------------------
| WEATHER BY LATITUDE + LONGITUDE
|--------------------------------------------------------------------------
|
| Example:
|
| GET /weather/coordinates?lat=22.3039&lon=70.8022
|
*/

app.get('/weather/coordinates', async (req, res) => {

    try {

        const lat = Number(req.query.lat);
        const lon = Number(req.query.lon);

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {

            return res.status(400).json({
                success: false,
                message: 'Valid lat and lon are required.',
                example:
                    '/weather/coordinates?lat=22.3039&lon=70.8022'
            });

        }

        if (lat < -90 || lat > 90) {

            return res.status(400).json({
                success: false,
                message:
                    'Latitude must be between -90 and 90.'
            });

        }

        if (lon < -180 || lon > 180) {

            return res.status(400).json({
                success: false,
                message:
                    'Longitude must be between -180 and 180.'
            });

        }

        const data = await getWeather({
            lat: lat,
            lon: lon
        });

        res.json({
            success: true,
            searchType: 'coordinates',

            coordinates: {
                lat: lat,
                lon: lon
            },

            data: data
        });

    } catch (error) {

        console.error(error);

        res.status(error.status || 500).json({
            success: false,
            message: error.message,
            details: error.details || null
        });

    }

});


/*
|--------------------------------------------------------------------------
| FLEXIBLE WEATHER ROUTE
|--------------------------------------------------------------------------
|
| City:
|   /weather?city=Rajkot
|
| Coordinates:
|   /weather?lat=22.3039&lon=70.8022
|
*/

app.get('/weather', async (req, res) => {

    try {

        const { city, lat, lon } = req.query;


        // -------------------------------------------------
        // CITY
        // -------------------------------------------------

        if (city) {

            const cityName = String(city).trim();

            const data = await getWeather({
                city: cityName
            });

            return res.json({

                success: true,

                searchType: 'city',

                city: cityName,

                data: data

            });

        }


        // -------------------------------------------------
        // LATITUDE + LONGITUDE
        // -------------------------------------------------

        if (lat !== undefined && lon !== undefined) {

            const latitude = Number(lat);
            const longitude = Number(lon);

            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        'lat and lon must be valid numbers.'
                });

            }

            const data = await getWeather({

                lat: latitude,

                lon: longitude

            });

            return res.json({

                success: true,

                searchType: 'coordinates',

                coordinates: {

                    lat: latitude,

                    lon: longitude

                },

                data: data

            });

        }


        // -------------------------------------------------
        // NO PARAMETERS
        // -------------------------------------------------

        return res.status(400).json({

            success: false,

            message:
                'Provide either city or lat/lon.',

            examples: [

                '/weather?city=Rajkot',

                '/weather?lat=22.3039&lon=70.8022'

            ]

        });

    } catch (error) {

        console.error(error);

        res.status(error.status || 500).json({

            success: false,

            message: error.message,

            details: error.details || null

        });

    }

});


/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: 'Route not found.'

    });

});


/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {

    console.log(
        `Weather API server running on http://localhost:${PORT}`
    );

});