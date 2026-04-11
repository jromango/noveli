import React from 'react'
import { GoogleBook } from '../services/googleBooks'
import BookSearchAutocomplete from './BookSearchAutocomplete'

interface SearchBarProps {
  onSelectBook: (book: GoogleBook) => void
}

export default function SearchBar({ onSelectBook }: SearchBarProps) {
  return <BookSearchAutocomplete onSelectBook={onSelectBook} />
}
