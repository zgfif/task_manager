'use strict';

import { cookieObject } from '../cookie_helper';
import { Task } from '../elements/task';
import { setDndListeners } from '../listeners/task_moving_listeners';
import { extractId } from '../selector_helper';
import { decorateDeadline } from '../helpers/date_helper';
import { enableScroll } from '../helpers/scrolling';

// CRUD functions for Task
class TaskRequest {
  constructor(method, path) {
    this.xhr = new XMLHttpRequest();
    this.xhr.open(method, path);
    this.xhr.setRequestHeader('Content-type', 'application/json', 'charset=utf-8');
    this.xhr.setRequestHeader('Authorization', cookieObject().Authorization);
  }

  send(data = null) {
    if (data != null) { data = JSON.stringify(data); }
    this.xhr.send(data);
  }

  loadTasks(targetPlace, projectId) {
    this.xhr.addEventListener('load', () => {
      const tasks = JSON.parse(this.xhr.response);
      if (!tasks.error) { renderTaskElements(tasks); }

      function renderTaskElements(tasks) {
        tasks.forEach(task => {
          // render tasks items on page
          const taskItem = new Task(targetPlace, task.name, task.id, projectId, task.status, task.deadline, task.priority);
          taskItem.populateNewTaskItem();
          taskItem.addToTasksArea();
          taskItem.setCommonTaskItemListeners();
        });
      }
      // After loaading all related to the project tasks we set draggable
      // listeners to each task in tasksArea.
      setDndListeners(targetPlace);
   });
  }

  saveTask(tasksNode, inputTask) {
    this.xhr.addEventListener('load', () => {
       const response = JSON.parse(this.xhr.response);
       // render task item on page if the new task was saved to db
       if(this.xhr.status == 201) {
         const projectId = extractId('project', tasksNode.parentNode.id),
               newTask = new Task(tasksNode, response.name, response.id, projectId, response.status, response.deadline, response.priority);
         newTask.populateNewTaskItem();
         newTask.addToTasksArea();
         newTask.setCommonTaskItemListeners();
         inputTask.value = '';
         // After appearing a new task, the tasks draggable area should be recalculated.
         setDndListeners(tasksNode);
       } else {
          alert('Error: name ' + response.name);
       }
    });
  }

  handleDestroying(taskItem) {
    this.xhr.addEventListener('load', () => {
      if(this.xhr.status == 204) {
        taskItem.remove();
      }
    });
  }

  handleNameUpdating(taskNameNode, newName) {
    this.xhr.addEventListener('load', () => {
      const response = JSON.parse(this.xhr.response);

      if(this.xhr.status == 200) {
        taskNameNode.textContent = newName;
      } else {
        alert('Error: name ' + response.name);
      }
    });
  }

  handlePriorityUpdating() {
    this.xhr.addEventListener('load', () => {
      if(this.xhr.status != 200) { alert('Error ' + this.xhr.response); }
    });
  }

  handleDeadlineUpdating(targetCalendar, taskItem) {
    this.xhr.addEventListener('load', () => {
      if(this.xhr.status != 200) {
        alert('Error ' + this.xhr.response);
      } else {
        const response = JSON.parse(this.xhr.response),
              deadlineNode = taskItem.querySelector('.deadline-notice');
        deadlineNode.innerHTML = decorateDeadline(response.deadline);
        enableScroll();
        targetCalendar.remove();
      }

    });
  }
}

export { TaskRequest };
