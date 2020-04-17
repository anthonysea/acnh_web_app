import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { useDebouncedCallback } from 'use-debounce';
import Fuse from "fuse.js";

// Bootstrap and React-Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button';

const PATH_BASE = 'http://localhost:5000'
const FISH = '/fish'
const BUGS = '/bugs'
const FOSSILS = '/fossils'
const VILLAGERS = '/villagers'

function App() {
  const [fish, setFish] = useState([])
  const [bugs, setBugs] = useState([])
  const [fossils, setFossils] = useState([])
  const [villagers, setVillagers] = useState([])
  const searchList = fish.concat(bugs, fossils, villagers)
  const fuseOpts = {
    isCaseSensitive: false,
    shouldShort: true,
    minMatchCharLength: 3,
    includeScore: true,
    threshold: 0.6,
    keys: [
      "name"
    ]
  }
  const fuse = new Fuse(searchList, fuseOpts)
  // Side effect to load in data from back end on component mounting
  useEffect(() => {
    const fetchData = async () => {
      axios.all([
        axios.get(`${PATH_BASE}${FISH}`),
        axios.get(`${PATH_BASE}${BUGS}`),
        axios.get(`${PATH_BASE}${FOSSILS}`),
        axios.get(`${PATH_BASE}${VILLAGERS}`),
      ]).then(axios.spread((fishRes, bugsRes, fossilsRes, villagersRes) => {
        setFish(fishRes.data)
        setBugs(bugsRes.data)
        setFossils(fossilsRes.data)
        setVillagers(villagersRes.data)
      }))
    }
    fetchData()
    console.log("json data changed")
  }, [])

  const [searchResults, setSearchResults] = useState([])
  const [query, setQuery] = useState("")
  // Side effect on query to update searchResults array
  useEffect(() => {
    console.log(query)
    setSearchResults(fuse.search(query).slice(0,10))
    console.log(searchResults)
  }, [query])

  // Callback to set the query value. This is debounced in the Search component
  const handleChange = (value) => {
    console.log("handleChange called, calling setQuery")
    setQuery(value)
  }

  return (
    <Container className="p-3">
      <Search
        value={query}
        onChange={handleChange}
      >
        Search
      </Search>
      <ul>
        {searchResults && searchResults.map((value, index) => {
          return <li key={index}>{value.item.name}</li>
        })}
      </ul>
    </Container>
    
  )
}

const Search = ({query, onChange, onSubmit, children}) => {

  const [debouncedCallback] = useDebouncedCallback(onChange, 300)

  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <Form.Group>
        <InputGroup>
          <Form.Control 
            type="text"
            value={query}
            onChange={(e) => debouncedCallback(e.target.value)}
            placeholder="Search for fish, bugs, fossils, and villagers"
          />
          <InputGroup.Append>
            <Button variant="info" type="submit">
              {children}
            </Button>
          </InputGroup.Append>
        </InputGroup>
        
      </Form.Group>
    </Form>
  )
}
  
export default App;



