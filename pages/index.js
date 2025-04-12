import React,{useState, useEffect} from 'react';
import { MdDelete, MdEdit, MdDone, MdConfirmationNumber } from 'react-icons/md';
import axios from 'axios';
import {format} from 'date-fns';
import { CgLayoutGrid } from 'react-icons/cg';

const index = () => {
  const [editText, setEditText] = useState();
  const [todos, setTodos] = useState([]);
  const [todosCopy, setTodosCopy] = useState(todos);
  const [todoInput, setTodoInput] = useState();
  const [editIndex, setEditIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState("");
  const [searchInputs, setSearchInputs] = useState([]);
  

  const [count, setCount] = useState(0);
  const [serch, setSerch] = useState("");
  const [searchItem, setSearchItem] = useState(serch)


  useEffect(() => {
    axios.get("http://localhost:8080/todos")
    fetchTodos();
  }, [count]);

  const editTodo = (index)=>{
    setEditIndex(index);
    setTodoInput(todos[index].title);
  }

  const fetchTodos = async()=>{
    try {
      const response = await axios.get("http://localhost:8080/todos");
      setTodos(response.data);
      setTodosCopy(response.data);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  const addTodos = async()=>{
    try {
      if(editIndex === -1){
        const response = await axios.post("http://localhost:8080/todos", {
          title: todoInput,
          completed: false,
        });
        setTodos(response.data);      
        setTodosCopy(response.data);
        setTodoInput("");
      }else{
        const todoToUpdate = {...todos[editIndex], title: todoInput};
        const response = await axios.put(`http://localhost:8080/todos/${todoToUpdate.id}`, {
          todoToUpdate,
        });
        console.log(response);
        const updateTodos = [...todos]
        updateTodos[editIndex] = response.data;
        setTodos(updateTodos);
        setTodoInput("");
        setEditIndex(-1);     
        setCount(count + 1);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const deleteTodo = async(id)=>{
    try {
      await axios.delete(`http://localhost:8080/todos/${id}`, {
        todoToUpdate,});
      setTodos(todos.filter((todo)=>todo.id !== id));
    } catch (error) {
      console.log(error);
    }
  }

  const toggleCompleted = async(index)=>{
    try {
      const todoToUpdate = {...todos[index], completed: !todos[index].completed};
  
      await axios.delete(`http://localhost:8080/todos/${id}`, {
        todoToUpdate,});
      const updateTodos = [...todos];
      updateTodos[index] = todoToUpdate;
      setTodos(updateTodos);
      setCount(count + 1);
    } catch (error) {
      console.log(error);
    }
  }

  const formatDate = (dateString)=>{
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  }

  const searchTodos = () =>{
    const filteredTodos = todos.filter((todo)=>todo.title.toLowerCase().includes(searchInputs.toLowerCase()));
    setTodos(filteredTodos);
  
  } 
  return <div>index</div>;  
};

export default index;
