import React, { useState, useEffect } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import axios from 'axios';
import { format } from 'date-fns';

const Index = () => {
  const [editText, setEditText] = useState("");
  const [todos, setTodos] = useState([]);
  const [todosCopy, setTodosCopy] = useState([]);
  const [todoInput, setTodoInput] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [search, setSearch] = useState("");
  
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchTodos();
  }, [count]);

  const fetchTodos = async () => {
    try {
      const response = await axios.get("http://localhost:8080/todos");
      setTodos(response.data);
      setTodosCopy(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addTodos = async () => {
    try {
      if (editIndex === -1) {
        const response = await axios.post("http://localhost:8080/todos", {
          title: todoInput,
          completed: false,
        });
        setCount(count + 1); // trigger refetch
        setTodoInput("");
      } else {
        const todoToUpdate = { ...todos[editIndex], title: todoInput };
        await axios.put(`http://localhost:8080/todos/${todoToUpdate.id}`, todoToUpdate);
        
        setEditIndex(-1);
        setTodoInput("");
        setCount(count + 1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/todos/${id}`);
      setCount(count + 1);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleCompleted = async (index) => {
    try {
      const todoToUpdate = { ...todos[index], completed: !todos[index].completed };
      await axios.put(`http://localhost:8080/todos/${todoToUpdate.id}`, todoToUpdate);

      setCount(count + 1);
    } catch (error) {
      console.log(error);
    }
  };

  const editTodo = (index) => {
    setEditIndex(index);
    setTodoInput(todos[index].title);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  const onHandleSearch = (value) => {
    const filteredTodos = todosCopy.filter(({ title }) =>
      title.toLowerCase().includes(value.toLowerCase())
    );

    setTodos(filteredTodos);
  };

  const onClearSearch = () => {
    setTodos(todosCopy);
  };

  useEffect(() => {
    if (search) {
      onHandleSearch(search);
    } else {
      onClearSearch();
    }
  }, [search]);

  const renderTodos = () => {
    return todos.map((todo, index) => (
      <li className='li' key={todo.id}>
        <label className='form-check-label'>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleCompleted(index)}
          />
          <span className='todo-text'>
            {`${todo.title} (${formatDate(todo.created_at)})`}
          </span>
        </label>

        <span className='span-button' onClick={() => deleteTodo(todo.id)}>
          <MdDelete />
        </span>
        <span className='span-button' onClick={() => editTodo(index)}>
          <MdEdit />
        </span>
      </li>
    ));
  };

  return (
    <div className='main-body'>
      <div className='todo-app'>
        <div className='input-section'>
          <input 
            type='text' 
            id='todoInput' 
            placeholder='Add item...' 
            value={todoInput} 
            onChange={(e) => setTodoInput(e.target.value)}
          />
          <button onClick={addTodos} className='add'>
            {editIndex === -1 ? "Add" : "Update"}
          </button>

          <input 
            type='text' 
            id='search-input' 
            placeholder='Search item...' 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => setSearch("")}>
            Clear Search
          </button>
        </div>

        <div className='todos'>
          <ul className='todo-list'>
            {renderTodos()}
          </ul>

          {todos.length === 0 && (
            <div>
              <img className='face' src='/theblockchaincoders.jpg' alt='No todos available' />
              <h1 className='not-found'>No todos available</h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
