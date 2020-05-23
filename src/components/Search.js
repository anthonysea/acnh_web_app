import React from 'react';
import { useDebouncedCallback } from 'use-debounce';

import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const Search = ({query, onQueryChange, category, onCategoryChange, children}) => {

    // categories array used to update the dropdown item choices
    const categories = ['fish', 'bugs', 'fossils', 'villagers']
    // Use a debouncedCallback so the onQueryChange method isn't called on every keypress but after a 300 ms delay
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
                return <Dropdown.Item 
                        key={categories.indexOf(item)} 
                        value={item} 
                        onSelect={() => onCategoryChange(item)}>
                          { item.charAt(0).toUpperCase().concat(item.slice(1)) }
                       </Dropdown.Item>
              })}
            </DropdownButton>
            <Form.Control 
              type="text"
              value={query}
              onChange={(e) => debouncedCallback(e.target.value)}
              placeholder={"Search for ".concat(category)}
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

export default Search;