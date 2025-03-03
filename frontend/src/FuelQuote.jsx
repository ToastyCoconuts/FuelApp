import { React, useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './styles.css'
import { client } from './apiClient';

const FuelQuoteForm = () => {

    const navigate = useNavigate();
    const username = localStorage.getItem('username')
    // today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    const maxDate = nextYear.toISOString().split('T')[0];

    const [gallonsRequested, setGallonsRequested] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [suggestedPricePerGallon, setSuggestedPricePerGallon] = useState(NaN);
    const [totalDue, setTotalDue] = useState(NaN);

    const [profileData, setProfileData] = useState(() => {
        const cachedData = localStorage.getItem('profileData');
        return cachedData ? JSON.parse(cachedData) : {
            fullname: '',
            street1: '',
            street2: '',
            city: '',
            state: '',
            zip: '',
        };
    });
    const address = profileData.street1 + ', ' + profileData.city + ', ' + profileData.state + ' ' + profileData.zip;
    useEffect(() => {
        const checkAuthorizationAndFetchData = async () => {
            try {
                // Check if we need to fetch data or if it was loaded from cache
                if (!localStorage.getItem('profileData')) {
                    const response = await client.get(`auth/profile/${username}`);
                    setProfileData(response.data);
                    localStorage.setItem('profileData', JSON.stringify(response.data));
                }
            } catch (err) {
                console.error("Authorization check failed or failed to fetch profile data:", err);
                localStorage.clear();
                navigate('/login');
            }
        };

        checkAuthorizationAndFetchData();
    }, [navigate, username]);

    const handleQuote = async (e) => {
        e.preventDefault();
        try {
            const res = await client.get(`auth/quote/${username}/${gallonsRequested}`);
            const { pricePerGallon } = res.data;
            setSuggestedPricePerGallon(parseFloat(pricePerGallon));
            setTotalDue(pricePerGallon * gallonsRequested);
        } catch (err) {
            alert("Unable to get quote - please try again")
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await client.post('auth/quote', {
                username,
                street: profileData.street1,
                city: profileData.city,
                state: profileData.state,
                zip: profileData.zip,
                deliveryDate,
                gallonsRequested,
                suggestedPricePerGallon,
                totalDue
            });
            alert("Successfully saved your new quote!")
            navigate('/quote/history')
        } catch (err) {
            alert("Unable to save quote. Please try again later");
        }
    }
    return (
        <>
            <br />
            <center>
                <h1>Fuel Quote Form</h1>
            </center>
            <div className="container mt-3">
                <form onSubmit={handleQuote}>
                    <div className="form-group">
                        <label htmlFor="clientName">Client Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="clientName"
                            value={profileData.fullname}
                            readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="deliveryAddress">Delivery Address</label>
                        <input
                            type="text"
                            className="form-control"
                            id="deliveryAddress"
                            value={address}
                            readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gallonsRequested">Gallons Requested</label>
                        <input
                            type="number"
                            className="form-control"
                            id="gallonsRequested"
                            required
                            value={gallonsRequested}
                            min={1}
                            onChange={e => setGallonsRequested(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="deliveryDate">Delivery Date</label>
                        <input
                            type="date"
                            className="form-control"
                            id="deliveryDate"
                            min={today}
                            max={maxDate}
                            value={deliveryDate}
                            required
                            onChange={e => setDeliveryDate(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">GENERATE QUOTE</button>
                    <br />
                </form>
                <div className="my-3 border-top border-dashed custom-border-color"></div>
                <br />
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="suggestedPrice">Suggested Price / gallon</label>
                        <input
                            type="text"
                            className="form-control"
                            id="suggestedPrice"
                            value={`$${suggestedPricePerGallon.toFixed(2)}`}
                            readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="totalAmountDue">Total Amount Due</label>
                        <input
                            type="text"
                            className="form-control"
                            id="totalAmountDue"
                            value={`$${totalDue.toFixed(2)}`}
                            readOnly
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" >SUBMIT QUOTE</button>

                </form>
            </div>
        </>
    );
};

export default FuelQuoteForm;
