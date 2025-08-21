"use client"

export default function Button(props){
    return(
        <>
          <button onClick={props.funcionalidad}>{props.texto}</button>
        </>
    )
}