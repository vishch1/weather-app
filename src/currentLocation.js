import React from "react";
import apiKeys from "./apiKeys";
import Clock from "react-live-clock";
import Forcast from "./forcast";
import loader from "./images/WeatherIcons.gif";
import ReactAnimatedWeather from "react-animated-weather";

const dateBuilder = (d) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return `${days[d.getDay()]}, ${d.getDate()} ${
    months[d.getMonth()]
  } ${d.getFullYear()}`;
};

const defaults = {
  color: "white",
  size: 112,
  animate: true,
};

class Weather extends React.Component {
  state = {
    lat: undefined,
    lon: undefined,
    temperatureC: undefined,
    temperatureF: undefined,
    city: undefined,
    country: undefined,
    humidity: undefined,
    main: undefined,
    icon: "CLEAR_DAY",
    errorMsg: null,
  };

  componentDidMount() {
    if (navigator.geolocation) {
      this.getPosition()
        .then((position) => {
          this.getWeather(
            position.coords.latitude,
            position.coords.longitude
          );
        })
        .catch(() => {
          this.getWeather(28.67, 77.22);

          alert(
            "Location access denied. Showing weather for the default location."
          );
        });
    } else {
      alert("Geolocation is not supported by this browser.");
    }

    this.timerID = setInterval(() => {
      if (this.state.lat && this.state.lon) {
        this.getWeather(this.state.lat, this.state.lon);
      }
    }, 600000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  getPosition = (options) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        options
      );
    });
  };

  getWeather = async (lat, lon) => {
    try {
      const response = await fetch(
        `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKeys.key}`
      );

      const data = await response.json();

      console.log("Weather API Response:", data);

      if (!response.ok || !data.main) {
        console.error("Weather API Error:", data);

        this.setState({
          errorMsg:
            data.message || "Unable to fetch weather data",
        });

        return;
      }

      let weatherIcon = "CLEAR_DAY";

      switch (data.weather[0].main) {
        case "Haze":
          weatherIcon = "CLEAR_DAY";
          break;
        case "Clouds":
          weatherIcon = "CLOUDY";
          break;
        case "Rain":
          weatherIcon = "RAIN";
          break;
        case "Snow":
          weatherIcon = "SNOW";
          break;
        case "Dust":
          weatherIcon = "WIND";
          break;
        case "Drizzle":
          weatherIcon = "SLEET";
          break;
        case "Fog":
        case "Smoke":
          weatherIcon = "FOG";
          break;
        case "Tornado":
          weatherIcon = "WIND";
          break;
        default:
          weatherIcon = "CLEAR_DAY";
      }

      this.setState({
        lat,
        lon,
        city: data.name,
        temperatureC: Math.round(data.main.temp),
        temperatureF: Math.round(data.main.temp * 1.8 + 32),
        humidity: data.main.humidity,
        main: data.weather[0].main,
        country: data.sys.country,
        icon: weatherIcon,
        errorMsg: null,
      });
    } catch (error) {
      console.error("Weather Fetch Error:", error);

      this.setState({
        errorMsg: "Failed to connect to weather service.",
      });
    }
  };

  render() {
    if (this.state.errorMsg) {
      return (
        <div style={{ color: "white", padding: "20px" }}>
          <h2>Weather Error</h2>
          <p>{this.state.errorMsg}</p>
        </div>
      );
    }

    if (this.state.temperatureC !== undefined) {
      return (
        <>
          <div className="city">
            <div className="title">
              <h2>{this.state.city}</h2>
              <h3>{this.state.country}</h3>
            </div>

            <div className="mb-icon">
              <ReactAnimatedWeather
                icon={this.state.icon}
                color={defaults.color}
                size={defaults.size}
                animate={defaults.animate}
              />
              <p>{this.state.main}</p>
            </div>

            <div className="date-time">
              <div className="dmy">
                <div className="current-time">
                  <Clock
                    format="HH:mm:ss"
                    interval={1000}
                    ticking={true}
                  />
                </div>

                <div className="current-date">
                  {dateBuilder(new Date())}
                </div>
              </div>

              <div className="temperature">
                <p>
                  {this.state.temperatureC}°
                  <span>C</span>
                </p>
              </div>
            </div>
          </div>

          <Forcast
            icon={this.state.icon}
            weather={this.state.main}
          />
        </>
      );
    }

    return (
      <>
        <img
          src={loader}
          alt="Loading weather information"
          style={{
            width: "50%",
            WebkitUserDrag: "none",
          }}
        />

        <h3
          style={{
            color: "white",
            fontSize: "22px",
            fontWeight: "600",
          }}
        >
          Detecting your location
        </h3>

        <h3
          style={{
            color: "white",
            marginTop: "10px",
          }}
        >
          Your current location will be displayed on the app
          <br />
          and used for calculating real-time weather.
        </h3>
      </>
    );
  }
}

export default Weather;