import React, { Component } from 'react';
import axios from 'axios'
import './App.css';

const PATH_BASE = 'http://localhost:5000'
const FISH = '/fish'
const BUGS = '/bugs'
const FOSSILS = '/fossils'
const VILLAGERS = '/villagers'

class App extends Component{

  constructor(props) {
    super(props)
    
    this.state = {
      fish: {},
      bugs: {},
      fossils: {},
      villagers: {},
      searchTerm: "",
    }

    this.fetchData = this.fetchData.bind(this)
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    axios.all([
      axios.get(`${PATH_BASE}${FISH}`),
      axios.get(`${PATH_BASE}${BUGS}`),
      axios.get(`${PATH_BASE}${FOSSILS}`),
      axios.get(`${PATH_BASE}${VILLAGERS}`),
    ]).then(axios.spread((fishRes, bugsRes, fossilsRes, villagersRes) => {
      this.setState({
        fish: fishRes.data,
        bugs: bugsRes.data,
        fossils: fossilsRes.data,
        villagers: villagersRes.data
      })
    }))
  }

  render() {
    const { searchTerm } = this.state
    return (
      <Search/>
    );
  }
}

const Search = ({value, onChange, onSubmit, children}) =>
  <form onsubmit={onSubmit}>
    {children}
    <input type="text"
      onChange={onChange}
    />
    <button type="submit">
      {children}
    </button>
  </form>

export default App;
