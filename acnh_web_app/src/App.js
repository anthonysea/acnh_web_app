import React, { Component } from 'react';
import axios from 'axios'
import './App.css';
import { debounce } from 'lodash'
const fuse = require("fuse.js")

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
    this.fuzzySearch = this.fuzzySearch.bind(this)
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

  debounceEventHandler(...args) {
    const debounced = debounce(...args)
    return function(e) {
      e.persist()
      return debounced(e)
    }
  }

  fuzzySearch(event) { 
    console.log(`fuzzy search called, event.target.value: ${event.target.value}`)
    this.setState({ searchTerm: event.target.value })
    
  }

  render() {
    return (
      <Search
        onChange={this.debounceEventHandler(this.fuzzySearch, 500)}
      >
      Search
      </Search>
    );
  }
}

const Search = ({value, onChange, onSubmit, children}) =>
  <form onSubmit={onSubmit}>
    {children}
    <input type="text"
      onChange={onChange}
    />
    <button type="submit">
      {children}
    </button>
  </form>

export default App;



