import React from 'react';
import MyTasks from './MyTask';

function EmpOverdueTask() {
  return <MyTasks defaultDue="OVERDUE" />;
}

export default EmpOverdueTask;