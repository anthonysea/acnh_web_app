import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { useDebouncedCallback } from 'use-debounce';
import Fuse from "fuse.js";

// Bootstrap and React-Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Image from 'react-bootstrap/Image';
import DropdownButton from 'react-bootstrap/DropdownButton';

// CSS
import './App.css'
import Dropdown from 'react-bootstrap/Dropdown';

// URL constants for backend API
const PATH_BASE = 'http://localhost:5000'
const FISH = '/fish'
const BUGS = '/bugs'
const FOSSILS = '/fossils'
const VILLAGERS = '/villagers'

// Main app entry point
function App() {
  const [fish, setFish] = useState([])
  const [bugs, setBugs] = useState([])
  const [fossils, setFossils] = useState([])
  const [villagers, setVillagers] = useState([])
  const [currentCategory, setCurrentCategory] = useState('fish')
  const [searchList, setSearchList] = useState(fish)
  // const searchList = fish.concat(bugs, fossils, villagers)
  const fuseOpts = {
    isCaseSensitive: false,
    shouldSort: true,
    minMatchCharLength: 3,
    includeScore: false,
    threshold: 0.3,
    keys: [
      "name",
      "location",
      "fossil_type",
      "species",
      "personality",
      "group",
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
        // set the searchList to the fish data
        setSearchList(fishRes.data)
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
    setSearchResults(fuse.search(query))
    console.log(searchResults)
  }, [query])

  // Callback to set the query value. This is debounced in the Search component
  const handleQueryChange = (value) => {
    console.log("handleChange called, calling setQuery")
    if (value.length >= 3) setQuery(value)
  }

  const handleCategoryChange = (value) => {
    if (value === 'fish') {
      setSearchList(fish)
    }
    else if (value === 'bugs') {
      setSearchList(bugs)
    }
    else if (value === 'fossils') {
      setSearchList(fossils)
    }
    else if (value === 'villagers') {
      setSearchList(villagers)
    }
    setCurrentCategory(value)
  }

  return (
    <Container className="p-3">

      <Jumbotron className="header">
        <h2>Animal Crossing: New Horizons Info Guide</h2>
      </Jumbotron>
      
      <Row>
        <Col>
          <Search
            value={query}
            onQueryChange={handleQueryChange}
            category={currentCategory}
            onCategoryChange={handleCategoryChange}
          >
            Search
          </Search>
        </Col>
      </Row>

      <Row> 
        <Col> 
          <ResultsTable results={searchResults}/>
        </Col>
      </Row>

    </Container>
  )
}

const ResultsTable = ({results}) => {
  let headings = []
  let ignoreTitles = []

  if (results.length > 0) {
    // Setup headings for all categories
    headings = Object.keys(results[0].item)
    ignoreTitles = ["id", "image_url", "critter_type"]
    headings = headings.filter(heading => heading !== "name")
    headings.unshift("name")

    // Remove shadow_size heading for bugs
    if (results[0].item['critter_type'] == 'bug') {
      headings = headings.filter(heading => heading !== 'shadow_size')
    }
  }

  const getReadableHeading = (heading) => {
    const heading_dict = {
      "location": "Location",
      "name": "Name",
      "price": "Price (Bells)",
      "seasonality_n": "Seasonality (Northern Hemisphere)",
      "seasonality_s": "Seasonality (Southern Hemisphere)",
      "shadow_size": "Shadow Size",
      "timeday": "Time Available",
      "fossil_type": "Fossil Gype",
      "fossil_group": "Fossil Group",
      "personality": "Personality",
      "species": "Species",
      "catchphrase": "Catchphrase"
    }

    return heading_dict[heading]
  }

  return (
    <Table bordered>
      <thead>
        <tr>
          {results.length > 0 && <th></th>}
          {results.length > 0 && 
          headings.filter(heading => !ignoreTitles.includes(heading)).map((heading) => {
            return <th key={headings.indexOf(heading)}>{getReadableHeading(heading)}</th>
          })}
        </tr>
      </thead>

      <tbody>
      {results && results.map((value) => {
        console.log(results.indexOf(value))
        return <ResultsItem 
                  key={value.refIndex} 
                  item={value.item} 
                  index={results.indexOf(value)}
                />
      })}
      </tbody>
  </Table>
  )
}

const ResultsItem = ({item, index}) => {
  let ignoreTitles = ["id", "name", "image_url", "critter_type"]

  if ((index === 0)){
    
  }

  return (
    <>
    <tr>
      {item.image_url &&
        <td><Image src={item.image_url} height="100" width="100" rounded></Image></td> 
      }
      <td>{item.name}</td>

      {Object.entries(item).map(([key, value]) => {
        if (ignoreTitles.includes(key) || !value) return null
        return <td key={key}>{value}</td>
      })}
    </tr>
    </>
    
  )
}

const Search = ({query, onQueryChange, category, onCategoryChange, children}) => {

  // categories array used to update the dropdown item choices
  const categories = ['fish', 'bugs', 'fossils', 'villagers']
  const [debouncedCallback] = useDebouncedCallback(onQueryChange, 300)

  return (
    <Form onSubmit={(e) => {e.preventDefault()}}>
      <Form.Group>
        <InputGroup>
          <DropdownButton
            as={InputGroup.Prepend}
            variant="outline-info"
            title={ category.charAt(0).toUpperCase().concat(category.slice(1)) }
          >
            {categories.filter(item => item !== category).map(item => {
              return <Dropdown.Item key={categories.indexOf(item)} value={item} onSelect={() => onCategoryChange(item)}>{ item.charAt(0).toUpperCase().concat(item.slice(1)) }</Dropdown.Item>
            })}
          </DropdownButton>
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



