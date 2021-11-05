import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import Binance from "binance-api-node";
import Chart from "react-apexcharts";
const client = Binance();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coinName: "",
      coins: [],
      coinMetas: [],
      coinInfos: [],
    };
  }
  onChange = (e) => {
    const state = this.state;
    state[e.target.name] = e.target.value;
    this.setState(state);
  };

  onKeyPress = (e) => {
    if (e.key === "Enter") {
      const name = this.state.coinName;
      axios
        .post("/api/coin", {
          name: name,
        })
        .then((result) => {
          const coins = [...this.state.coins, result.data];
          const coinMetas = [
            ...this.state.coinMetas,
            {
              options: {},
              series: [],
            },
          ];
          const coinInfos = [
            ...this.state.coinInfos,
            {
              volume: 0,
              percent: 0,
            },
          ];
          this.setState({
            coins,
            coinMetas,
            coinInfos,
          });
          this.updateCoins(coins);
        });
    }
  };
  updateCoins(coins) {
    for (let i = 0, l = coins.length; i < l; i++) {
      client
        .candles({ symbol: coins[i].name + "USDT", interval: "1m" })
        .then((frames) => {
          frames = frames.slice(-200);
          this.setState({
            coinMetas: this.state.coinMetas.map((coinMeta, index) => {
              if (index === i)
                return {
                  options: {
                    xaxis: {
                      categories: frames.map((frame) => {
                        return new Date(frame.openTime).toISOString();
                      }),
                      labels: {
                        show: false,
                      },
                    },
                  },
                  series: [
                    {
                      name: "volume",
                      data: frames.map((frame) => {
                        return frame.volume;
                      }),
                    },
                  ],
                };
              else return coinMeta;
            }),
            coinInfos: this.state.coinInfos.map((coinMeta, index) => {
              if (index === i) {
                return {
                  volume: frames[frames.length - 1].volume,
                  percent:
                    (frames[frames.length - 1].volume * 100) /
                    (Number(frames[frames.length - 1].volume) +
                      Number(frames[frames.length - 2].volume)),
                };
              } else {
                return coinMeta;
              }
            }),
          });
        });
    }
  }
  timer() {
    const coins = this.state.coins;
    this.setState({
      coins: coins,
      coinMetas: coins.map((value) => {
        return {
          options: {},
          series: [],
        };
      }),
      coinInfos: coins.map((value) => {
        return {
          volume: 0,
          percent: 0,
        };
      }),
    });
  }
  componentDidMount() {
    axios.get("/api/coin").then((res) => {
      const coins = res.data;
      this.setState({
        coins: coins,
        coinMetas: res.data.map((value) => {
          return {
            options: {},
            series: [],
          };
        }),
        coinInfos: res.data.map((value) => {
          return {
            volume: 0,
            percent: 0,
          };
        }),
      });
      this.updateCoins(coins);
      setInterval(this.timer, 1000);
    });
  }

  render() {
    return (
      <div class="container">
        <div class="form-group">
          <input
            type="text"
            class="form-control"
            name="coinName"
            value={this.state.coinName}
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            placeholder="Search coin name"
          />
        </div>
        <div class="row">
          {this.state.coins.map((coin, index) => (
            <div class="col-md-4">
              <Chart
                options={this.state.coinMetas[index].options}
                series={this.state.coinMetas[index].series}
                type="line"
                height="300"
              />
              <div className="text-center font-weight-bolder">{coin.name}</div>
              <div className="float-left">
                VOL: {Number(this.state.coinInfos[index].volume).toFixed(2)}{" "}
              </div>
              <div className="float-right">
                {Number(this.state.coinInfos[index].percent).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default App;
