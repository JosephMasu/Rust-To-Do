use actix_web::{ web, App, HttpServer, Responder, HttpResponse};
use serde::{Serialize, Deserialize};
use actix_cors::Cors;
use uuid::Uuid;
use std::sync::Mutex;
use chrono::{DateTime, Utc};

# [derive(Serialize, Deserialize)]
struct TodoItem {
    id: Uuid,
    title: String,
    completed: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

# [derive(Deserialize)]
struct CreateTodoItem{
    title: String,
    completed: bool,
}
# [derive(Deserialize)]
struct UpdateTodoItem{
    title: Option<String>,
    completed: Option<bool>,
}

struct AppState {
    todos: Mutex<Vec<TodoItem>>,
}
 async fn get_todos(data: web::Data<AppState>) -> impl Responder {
    let todos = data.todos.lock().unwrap();
    HttpResponse::Ok().json(&*todos)
        
 } 

 async fn create_todo(item: web::Json<CreateTodoItem>, data: web::Data<AppState>) -> impl Responder {
    let mut todos = data.todos.lock().unwrap();
    let new_todo = TodoItem {
        id: Uuid::new_v4(),
        title: item.title.clone(),
        completed: item.completed,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    todos.push(new_todo);
    HttpResponse::Ok().json(&*todos)
}

async fn update_todo_item(path: web::Path<Uuid>, item: web::Json<UpdateTodoItem>, data: web::Data<AppState>) -> impl Responder {
    let mut todos = data.todos.lock().unwrap();
    if let Some(todo) = todos.iter_mut().find(|t| t.id == *path) {
        if let Some(title) = &item.title {
            todo.title = title.clone();
        }
        if let Some(completed) = item.completed {
            todo.completed = completed;
        }
        todo.updated_at = Utc::now();
        HttpResponse::Ok().json(&*todos)
    } else {
        HttpResponse::NotFound().body("Todo not found")
    }
    
}

async fn delete_todo_item(path: web::Path<Uuid>, data: web::Data<AppState>) -> impl Responder {
    let mut todos = data.todos.lock().unwrap();
    if let Some(_index) = todos.iter().position(|t| t.id == *path) {
        todos.retain(|t| t.id != *path);
        HttpResponse::Ok().json(&*todos)
    } else {
        HttpResponse::NotFound().body("Todo not found")
    }
}
                    
#[actix_web::main]

async fn main() -> std::io::Result<()> {
    let app_state = web::Data::new(AppState {
        todos: Mutex::new(Vec::new()),
    });
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .app_data(app_state.clone())
            .wrap(cors).route("/todos", web::get().to(get_todos))
            .route("/todos", web::post().to(create_todo))
            .route("/todos/{id}", web::put().to(update_todo_item))
            .route("/todos/{id}", web::delete().to(delete_todo_item))
        })

            .bind("127.0.0.1:8080")?
            .run().await
}
