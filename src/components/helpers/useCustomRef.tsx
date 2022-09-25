import React, { useRef } from 'react';

export default function useCustomRef<T extends HTMLElement>(){
    const myRef = useRef<T>(null)
    return {ref: myRef}
}