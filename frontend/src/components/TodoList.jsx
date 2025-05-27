import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  List,
  ListItem,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Select,
  MenuItem,
  Paper,
  Typography,
  Grid,
  Tooltip,
  FormControl,
  InputLabel,
  IconButton,
  useTheme,
  Switch,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  BsFillPencilFill,
  BsFillTrashFill,
  BsCheckCircleFill,
  BsClockFill,
  BsArrowRepeat,
  BsSun,
  BsMoon,
} from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';

const statusOptions = [
  { value: 'pending', label: 'Pending', color: '#6c757d', Icon: BsClockFill },
  { value: 'in_progress', label: 'In Progress', color: '#f0ad4e', Icon: BsArrowRepeat },
  { value: 'completed', label: 'Completed', color: '#198754', Icon: BsCheckCircleFill },
];

const fadeSlideVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const TodoList = () => {
  const systemTheme = useTheme();
  const [mode, setMode] = useState('light');
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(null);
  const [editedTask, setEditedTask] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('todo-theme');
    if (saved) setMode(saved);
    else setMode(systemTheme.palette.mode);
  }, [systemTheme.palette.mode]);

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    localStorage.setItem('todo-theme', mode);
  }, [mode]);

  const isDark = mode === 'dark';

  const fetchTodos = () => {
    setLoading(true);
    axios
      .get('http://192.168.0.160:5000/todos')
      .then((res) => setTodos(res.data))
      .catch(() => setError('Failed to fetch todos'))
      .finally(() => setLoading(false));
  };

  const addTodo = () => {
    if (!task.trim()) return;
    setLoading(true);
    axios
      .post('http://192.168.0.160:5000/todos', { task, status: 'pending' })
      .then((res) => {
        setTodos((prev) => [...prev, res.data]);
        setTask('');
        setSuccess('Task added successfully!');
      })
      .catch(() => setError('Failed to add task'))
      .finally(() => setLoading(false));
  };

  const updateStatus = (id, status) => {
    setLoading(true);
    axios
      .put(`http://192.168.0.160:5000/todos/${id}`, { status })
      .then((res) => {
        setTodos((prev) => prev.map((todo) => (todo._id === id ? res.data : todo)));
        setSuccess('Task status updated!');
      })
      .catch(() => setError('Failed to update task status'))
      .finally(() => setLoading(false));
  };

  const editTodo = (id, currentTask) => {
    setEditing(id);
    setEditedTask(currentTask);
  };

  const saveEditedTodo = (id) => {
    if (!editedTask.trim()) return;
    setLoading(true);
    axios
      .put(`http://192.168.0.160:5000/todos/${id}`, { task: editedTask })
      .then((res) => {
        setTodos((prev) => prev.map((todo) => (todo._id === id ? res.data : todo)));
        setEditing(null);
        setEditedTask('');
        setSuccess('Task updated successfully!');
      })
      .catch(() => setError('Failed to update task'))
      .finally(() => setLoading(false));
  };

  const confirmDelete = (id) => setDeleteConfirmId(id);

  const cancelDelete = () => setDeleteConfirmId(null);

  const deleteTodo = (id) => {
    setLoading(true);
    axios
      .delete(`http://192.168.0.160:5000/todos/${id}`)
      .then(() => {
        setTodos((prev) => prev.filter((todo) => todo._id !== id));
        setSuccess('Task deleted successfully!');
        cancelDelete();
      })
      .catch(() => setError('Failed to delete task'))
      .finally(() => setLoading(false));
  };

  // Calculate summary counts
  const getStatusSummary = () => {
    const summary = { pending: 0, in_progress: 0, completed: 0 };
    todos.forEach(todo => {
      if (summary[todo.status] !== undefined) {
        summary[todo.status]++;
      }
    });
    return summary;
  };

  const summary = getStatusSummary();

  return (
    <Box
      sx={{
        bgcolor: isDark ? '#121212' : '#f5f7fa',
        minHeight: '100vh',
        p: { xs: 2, sm: 4 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        transition: 'background-color 0.4s ease',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: isDark ? '#eee' : '#111',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 720,
          width: '100%',
          borderRadius: 5,
          p: { xs: 3, sm: 5 },
          boxShadow: isDark
            ? '0 8px 24px rgba(255 255 255 / 0.1)'
            : '0 8px 24px rgba(0 0 0 / 0.12)',
          bgcolor: isDark ? '#1e1e1e' : '#fff',
          transition: 'background-color 0.4s ease, box-shadow 0.4s ease',
        }}
      >
        {/* Header with dark mode toggle */}
        <Grid container justifyContent="space-between" alignItems="center" mb={3}>
          <Grid item>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: '0.1em',
                userSelect: 'none',
                color: isDark ? '#90caf9' : '#1976d2',
              }}
            >
              📝 LMT To-Do List
            </Typography>
          </Grid>

          <Grid item>
            <FormControlLabel
              control={
                <Switch
                  checked={isDark}
                  onChange={() => setMode(isDark ? 'light' : 'dark')}
                  inputProps={{ 'aria-label': 'Toggle dark mode' }}
                  icon={<BsSun color="#fbc02d" size={20} />}
                  checkedIcon={<BsMoon color="#90caf9" size={20} />}
                />
              }
              label={isDark ? 'Dark Mode' : 'Light Mode'}
              sx={{
                userSelect: 'none',
                color: isDark ? '#90caf9' : '#555',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            />
          </Grid>
        </Grid>

        {/* Summary */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            mb: 3,
          }}
          aria-label="To-do status summary"
        >
          {statusOptions.map(({ value, label, color, Icon }) => (
            <Box
              key={value}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, color, fontWeight: 600 }}
            >
              <Icon size={20} />
              <span>{label}: {summary[value]}</span>
            </Box>
          ))}
        </Box>

        {/* Add Task */}
        <Grid container spacing={2} alignItems="center" mb={4}>
          <Grid item xs={12} sm={9}>
            <TextField
              variant="outlined"
              fullWidth
              label="Add a new task"
              placeholder="What needs to be done?"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              disabled={loading || editing !== null}
              size="medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && task.trim() && !loading) addTodo();
              }}
              autoComplete="off"
              inputProps={{ 'aria-label': 'Add new task input' }}
              sx={{
                bgcolor: isDark ? '#2a2a2a' : 'transparent',
                input: { color: isDark ? '#eee' : 'inherit' },
                '& label': { color: isDark ? '#90caf9' : undefined },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="contained"
              fullWidth
              color="primary"
              disabled={loading || editing !== null || !task.trim()}
              onClick={addTodo}
              sx={{
                height: 56,
                fontWeight: 700,
                letterSpacing: '0.06em',
                transition: 'background-color 0.3s ease',
                '&:hover': {
                  backgroundColor: isDark ? '#1565c0' : undefined,
                },
              }}
              aria-label="Add task button"
            >
              Add Task
            </Button>
          </Grid>
        </Grid>

        {/* Loading */}
        {loading && (
          <Box textAlign="center" py={5}>
            <CircularProgress size={54} color="primary" />
          </Box>
        )}

        {/* Empty State */}
        {!loading && todos.length === 0 && (
          <Typography
            variant="subtitle1"
            color="textSecondary"
            align="center"
            sx={{ userSelect: 'none' }}
          >
            No tasks yet. Add a task to get started!
          </Typography>
        )}

        {/* Todo List */}
        <List>
          <AnimatePresence>
            {todos.map(({ _id, task, status }) => {
              const statusInfo = statusOptions.find((s) => s.value === status);
              const isEditingThis = editing === _id;

              return (
                <motion.div
                  key={_id}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={fadeSlideVariants}
                  style={{ marginBottom: 12 }}
                >
                  <ListItem
                    sx={{
                      bgcolor: isDark ? '#333' : '#fafafa',
                      borderRadius: 2,
                      px: 2,
                      py: 1.5,
                      boxShadow: isDark
                        ? '0 1px 3px rgba(255 255 255 / 0.1)'
                        : '0 1px 3px rgba(0 0 0 / 0.1)',
                      userSelect: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Task text or edit input */}
                    {isEditingThis ? (
                      <TextField
                        value={editedTask}
                        onChange={(e) => setEditedTask(e.target.value)}
                        size="small"
                        autoFocus
                        disabled={loading}
                        sx={{
                          flex: 1,
                          mr: 1,
                          input: { color: isDark ? '#eee' : '#111' },
                          bgcolor: isDark ? '#2a2a2a' : 'transparent',
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && editedTask.trim()) saveEditedTodo(_id);
                          if (e.key === 'Escape') setEditing(null);
                        }}
                        aria-label={`Edit task ${task}`}
                      />
                    ) : (
                      <Typography
                        sx={{
                          flex: 1,
                          color: statusInfo.color,
                          textDecoration: status === 'completed' ? 'line-through' : 'none',
                          fontWeight: 600,
                          wordBreak: 'break-word',
                          userSelect: 'text',
                        }}
                        aria-label={`Task: ${task} - Status: ${statusInfo.label}`}
                      >
                        {task}
                      </Typography>
                    )}

                    {/* Status selector */}
                    {!isEditingThis && (
                      <FormControl
                        size="small"
                        sx={{ minWidth: 140 }}
                        disabled={loading}
                        aria-label="Change task status"
                      >
                        <Select
                          value={status}
                          onChange={(e) => updateStatus(_id, e.target.value)}
                          sx={{
                            color: statusInfo.color,
                            fontWeight: 600,
                            '& .MuiSelect-icon': { color: statusInfo.color },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: statusInfo.color },
                            bgcolor: isDark ? '#222' : 'transparent',
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: { bgcolor: isDark ? '#333' : '#fff', color: isDark ? '#eee' : '#111' },
                            },
                          }}
                          aria-label="Select status"
                        >
                          {statusOptions.map(({ value, label, color }) => (
                            <MenuItem
                              key={value}
                              value={value}
                              sx={{ color }}
                            >
                              {label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {/* Action buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {isEditingThis ? (
                        <>
                          <Tooltip title="Save">
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              onClick={() => saveEditedTodo(_id)}
                              disabled={loading || !editedTask.trim()}
                              aria-label="Save edited task"
                            >
                              Save
                            </Button>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <Button
                              variant="outlined"
                              size="small"
                              color="secondary"
                              onClick={() => setEditing(null)}
                              disabled={loading}
                              aria-label="Cancel editing task"
                            >
                              Cancel
                            </Button>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => editTodo(_id, task)}
                              disabled={loading}
                              aria-label="Edit task"
                            >
                              <BsFillPencilFill color={isDark ? '#90caf9' : '#1976d2'} size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => confirmDelete(_id)}
                              disabled={loading}
                              aria-label="Delete task"
                            >
                              <BsFillTrashFill color={isDark ? '#f44336' : '#d32f2f'} size={18} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </ListItem>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </List>

        {/* Delete confirmation dialog */}
        <Dialog
          open={deleteConfirmId !== null}
          onClose={cancelDelete}
          aria-labelledby="delete-confirm-dialog-title"
          aria-describedby="delete-confirm-dialog-description"
        >
          <DialogTitle id="delete-confirm-dialog-title">Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-confirm-dialog-description">
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDelete} color="primary" aria-label="Cancel delete">
              Cancel
            </Button>
            <Button
              onClick={() => deleteTodo(deleteConfirmId)}
              color="error"
              aria-label="Confirm delete"
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar notifications */}
        <Snackbar
          open={!!error}
          autoHideDuration={4000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setError('')} variant="filled" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccess('')} variant="filled" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default TodoList;
