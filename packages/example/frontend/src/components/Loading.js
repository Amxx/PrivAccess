import React, { Component } from 'react';
import '../css/Loading.css';

class Loading extends Component
{
  render()
  {
    return (
      <div id='Loading' style={{}}>
      <svg xmlns='http://www.w3.org/2000/svg' width='100' viewBox='0 0 250 250' preserveAspectRatio='xMidYMid meet'>
        <path className='path' stroke='#63d2f9' fill='none' strokeWidth="1"
          strokeDasharray='500' strokeDashoffset='500'
          d="M 179.67,199.93
            C 179.67,199.93 179.67,147.93 179.67,147.93
              179.67,147.93 123.27,147.93 123.27,147.93
              107.93,147.93 93.73,156.02 85.87,169.21
              85.87,169.21 67.59,199.93 67.59,199.93
              67.59,199.93 179.67,199.93 179.67,199.93 Z" />
        <path className='path' stroke='#4e5ee4' fill="none" strokeWidth="1"
          strokeDasharray='500' strokeDashoffset='500'
          d="M 0.17,0.17
            C 0.17,0.17 0.17,52.17 0.17,52.17
              0.17,52.17 148.72,52.17 148.72,52.17
              148.72,52.17 179.67,0.17 179.67,0.17
              179.67,0.17 0.17,0.17 0.17,0.17 Z" />
        <path className='path' stroke='#63b0f9' fill="none" strokeWidth="1"
          strokeDasharray='500' strokeDashoffset='500'
          d="M 71.26,81.43
            C 71.26,81.43 0.33,199.93 0.33,199.93
              0.33,199.93 60.76,199.93 60.76,199.93
              60.76,199.93 145.58,58.17 145.58,58.17
              145.58,58.17 112.21,58.17 112.21,58.17
              95.43,58.17 79.88,67.00 71.26,81.43 Z" />
      </svg>
      </div>
    );
  }
}

export default Loading;
