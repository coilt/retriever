"use client"
import { useEffect } from 'react';

export default function StringComponent() {
  useEffect(() => {
    function convertToString(number) {
      return number.toString();
    }

    const number = 15;
    const stringValue = number.toString();

    console.log(`Original number: ${number}`);
    console.log(`Converted to string: ${stringValue}`);
    console.log(`Type of stringValue: ${typeof stringValue}`);
  }, []); // The empty array ensures this runs only once, similar to componentDidMount

  return null; // No JSX to render
}
