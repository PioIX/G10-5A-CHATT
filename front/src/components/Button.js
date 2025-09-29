"use client"

export default function Button(props){
    return (
        <button 
          onClick={props.funcionalidad} 
          className={props.className}
        >
          {props.texto}
        </button>
    )
}
