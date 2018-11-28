import React, { Component } from 'react';
import './App.css';

class App extends Component {
  /**
   * Constructor.
   *
   * @param {object} props
   */
  constructor(props) {
    super(props);

    this.state = {
      Trains: [],
      LatestUpdate: '',
      StopPointDeviations: [],
    };
  }

  /**
   * Update dashboard on mount.
   */
  componentDidMount() {
    this.update();
    setInterval(this.update.bind(this), 60000);
  }

  /**
   * Fetch and update state with new data from SL's realtime api.
   */
  update() {
    const apikey = process.env.REACT_APP_APIKEY;
    const id = 9527;
    const path = `?key=${apikey}&siteid=${id}&timewindow=60&bus=false&metro=false&tram=false&ship=false`;

    let url = '';
    if (process.env.NODE_ENV === 'development') {
      url = '/api/api2/realtimedeparturesv4.json' + path;
    } else {
      url = '/api/' + path;
    }

    fetch(url)
    .then(res => res.json())
    .then(res => {
      if (res.Message && res.Message.length) {
        this.setState({
          Message: res.Message
        })
      } else {
        this.setState({
          Trains: res.ResponseData.Trains,
          LatestUpdate: res.ResponseData.LatestUpdate,
          StopPointDeviations: res.ResponseData.StopPointDeviations,
        });
      }
    });
  }

  /**
   * Render component.
   */
  render() {
    const { LatestUpdate, Message, Trains, StopPointDeviations } = this.state;
    const station = Trains.length > 1 ? Trains[0].StopAreaName : 'N/A';

    if (Message && Message.length) {
      return <p>{Message}</p>
    }

    return (
      <div className="App">
        <header className="header">
          <p>Avgående Tåg</p>
          <h1>{station}</h1>
          <p className="updatedat">Senast uppdaterad: {LatestUpdate.split('T')[1]}</p>
        </header>
        {StopPointDeviations.map((stop, i) => (
          <div className="deviation" key={i}>
            <p>{stop.Deviation.Text}</p>
          </div>
        ))}
        {Trains.map((train, i) => (
          <div className="columns" key={i}>
            <div className="column">
              <span className="line">{train.LineNumber}</span>
            </div>
            <div className="column">
              <span className="name">{train.Destination}</span>
              {(train.Deviations||[]).map((devi, i) => (
                <p key={i}>{devi.Text}</p>
              ))}
            </div>
            <div className="column">
              <span className="time" dangerouslySetInnerHTML={{__html:train.DisplayTime.replace('min', '<span>min</span>')}}></span>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default App;
