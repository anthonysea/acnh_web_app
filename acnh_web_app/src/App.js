import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Fuse from "fuse.js";
import ReactPaginate from 'react-paginate';

// Bootstrap and React-Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Table from 'react-bootstrap/Table';
import Image from 'react-bootstrap/Image';

// CSS
import './App.css'

// Components
import Search from './components/Search.js'

// URL constants for backend API
const PATH_BASE = 'http://localhost:5000'
const FISH = '/fish'
const BUGS = '/bugs'
const FOSSILS = '/fossils'
const VILLAGERS = '/villagers'

// Main app entry point
function App() {
  const PER_PAGE = 10
  const [fish, setFish] = useState([])
  const [bugs, setBugs] = useState([])
  const [fossils, setFossils] = useState([])
  const [villagers, setVillagers] = useState([])
  const [currentCategory, setCurrentCategory] = useState('fish')
  const [searchList, setSearchList] = useState(fish)
  const [searchResults, setSearchResults] = useState([])
  const [paginatedResults, setPaginatedResults] = useState([])

  const [offset, setOffset] = useState(0)
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

  /* CDM */
  // Side effect to load in data from back end on component mounting
  useEffect(() => {
    const fetchData = async () => {
      await axios.all([
        axios.get(`${PATH_BASE}${FISH}`),
        axios.get(`${PATH_BASE}${BUGS}`),
        axios.get(`${PATH_BASE}${FOSSILS}`),
        axios.get(`${PATH_BASE}${VILLAGERS}`),
      ]).then(axios.spread((fishRes, bugsRes, fossilsRes, villagersRes) => {
        setFish(fishRes.data)
        setBugs(bugsRes.data)
        setFossils(fossilsRes.data)
        setVillagers(villagersRes.data)
        // set the searchList to the fish data on first load
        setSearchList(fishRes.data)
        setSearchResults(fishRes.data)
        setPaginatedResults(fishRes.data.slice(offset * PER_PAGE, PER_PAGE))
        
      }))
    }
    fetchData()
    console.log(searchResults.length)
    console.log("json data loaded")
  }, [])

  
  const [query, setQuery] = useState("")
  // Side effect on query to update searchResults array
  useEffect(() => {
    console.log("query: ", query)
    setSearchResults(fuse.search(query))
    console.log("searchResults: ", searchResults)

    // console.log("searchResults length: ", searchResults.length)
    // setPageCount(Math.ceil(searchResults.length / perPage))
  }, [query])

  useEffect(() => {
    setPaginatedResults(searchResults.slice(offset * PER_PAGE, (offset * PER_PAGE) + PER_PAGE))
  }, [searchResults])

  // Callback to set the query value. This is debounced in the Search component
  const handleQueryChange = (value) => {
    console.log("handleChange called, calling setQuery")
    if (value.length >= 3) setQuery(value)
  }

  // Update the data set to search the selected category as well as update the
  // searchResults list to point to the entire dataset on initial category selection
  const handleCategoryChange = (value) => {
    if (value === 'fish') {
      setSearchList(fish)
      setSearchResults(fish)

    }
    else if (value === 'bugs') {
      setSearchList(bugs)
      setSearchResults(bugs)
    }
    else if (value === 'fossils') {
      setSearchList(fossils)
      setSearchResults(fossils)
    }
    else if (value === 'villagers') {
      setSearchList(villagers)
      setSearchResults(villagers)
    }
    setCurrentCategory(value)
  }

  const handlePageClick = (data) => {
    console.log('handlePageClick called, data.selected: ', data.selected)
    setOffset(data.selected)
    setPaginatedResults(searchResults.slice(data.selected * PER_PAGE, (data.selected * PER_PAGE) + PER_PAGE))
  }


  return (
    <Container className="p-2">

      <Jumbotron className="header">
        <h2>🦝Animal Crossing: New Horizons Info Guide🍃</h2>
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
          <ResultsTable results={paginatedResults}/>
          <ReactPaginate 
            previousLabel={"<"}
            nextLabel={">"}
            breakClassName={'break-me'}
            pageCount={Math.ceil(searchResults.length / PER_PAGE)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            subContainerClassName={'pages pagination'}
            activeClassName={'active'}
          />
        </Col>
      </Row>

    </Container>
  )
}

const ResultsTable = ({results}) => {
  let headings = []
  let ignoreTitles = []

  console.log("results: ", results)
  if (results.length > 0) {
    // When page is first loaded, no query is selected, but we want to show the entire fish dataset.
    // Need to alter the inital results list to follow formatting of the list returned by the fuse search
    if (!("item" in results[0])) {
      results = results.map(obj => new Object({"item": obj}))
    }

    headings = Object.keys(results[0].item)
    // Setup headings for all categories
    ignoreTitles = ["id", "image_url", "critter_type"]
    headings = headings.filter(heading => heading !== "name")
    headings.unshift("name")

    // Remove shadow_size heading for bugs
    if (results[0].item['critter_type'] === 'bug') {
      headings = headings.filter(heading => heading !== 'shadow_size')
    }
  }

  // Utility function to get the corresponding formatted heading from the properties of the records
  const getReadableHeading = (heading) => {
    const heading_dict = {
      "location": "Location",
      "name": "Name",
      "price": "Price (Bells)",
      "seasonality_n": "Seasonality (Northern Hemisphere)",
      "seasonality_s": "Seasonality (Southern Hemisphere)",
      "shadow_size": "Shadow Size",
      "timeday": "Time Available",
      "fossil_type": "Fossil Type",
      "group": "Fossil Group",
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
        return <ResultsItem 
                  key={results.indexOf(value)} 
                  item={value.item} 
                  index={results.indexOf(value)}
                />
      })}
      </tbody>
  </Table>
  )
}

const ResultsItem = ({item, index}) => {
  // Headings that do not need to be displayed to the user
  let ignoreTitles = ["id", "name", "image_url", "critter_type"]

  return (
    <tr>
      {item.image_url &&
        // don't want to send requests for the images in development
        // <td><Image src={item.image_url} height="100" width="100" rounded></Image></td> 
        <td><Image src="" height="100" width="100" rounded></Image></td> 

      }
      <td>{item.name}</td>

      {/* Use map to only render the properties that are not in ignoreTitles */}
      {Object.entries(item).map(([key, value]) => {
        // For fossil group with fossils, want to render empty cell instead of nothing
        if (ignoreTitles.includes(key) || (!value && (key === "shadow_size"))) return null
        return <td key={key}>{value}</td>
      })}
    </tr>
  )
}
  
export default App;