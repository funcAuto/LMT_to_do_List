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

  // Persist theme to localStorage for demo
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
      .get('http://192.168.0.115:5000/todos')
      .then((res) => setTodos(res.data))
      .catch(() => setError('Failed to fetch todos'))
      .finally(() => setLoading(false));
  };

  const addTodo = () => {
    if (!task.trim()) return;
    setLoading(true);
    axios
      .post('http://192.168.0.115:5000/todos', { task, status: 'pending' })
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
      .put(`http://192.168.0.115:5000/todos/${id}`, { status })
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
      .put(`http://192.168.0.115:5000/todos/${id}`, { task: editedTask })
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
      .delete(`http://192.168.0.115:5000/todos/${id}`)
      .then(() => {
        setTodos((prev) => prev.filter((todo) => todo._id !== id));
        setSuccess('Task deleted successfully!');
        cancelDelete();
      })
      .catch(() => setError('Failed to delete task'))
      .finally(() => setLoading(false));
  };

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
            sx={{ mt: 6, fontStyle: 'italic', color: isDark ? '#aaa' : '#777' }}
          >
            No tasks yet — get started by adding one above!
          </Typography>
        )}

        {/* Todo List */}
        <List disablePadding>
          <AnimatePresence>
            {todos.map((todo) => {
              const status = statusOptions.find((s) => s.value === (todo.status || 'pending')) || statusOptions[0];
              const isEditing = editing === todo._id;

              return (
                <motion.div
                  key={todo._id}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={fadeSlideVariants}
                  transition={{ duration: 0.3 }}
                >
                  <ListItem
                    sx={{
                      bgcolor: isDark ? '#2a2a2a' : '#fefefe',
                      color: isDark ? '#eee' : '#111',
                      mb: 2,
                      borderRadius: 3,
                      boxShadow: isDark
                        ? '0 3px 8px rgba(255 255 255 / 0.05)'
                        : '0 3px 8px rgba(0 0 0 / 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      py: 1.5,
                      px: 3,
                      transition: 'background-color 0.3s ease',
                      '&:hover': {
                        boxShadow: isDark
                          ? '0 6px 16px rgba(255 255 255 / 0.1)'
                          : '0 6px 20px rgba(0 0 0 / 0.12)',
                      },
                    }}
                  >
                    {/* Status selector */}
                    <FormControl
                      size="small"
                      sx={{ minWidth: 140, mr: 3 }}
                      aria-label={`Change status for task "${todo.task}"`}
                    >
                      <InputLabel id={`status-label-${todo._id}`}>Status</InputLabel>
                      <Select
                        labelId={`status-label-${todo._id}`}
                        value={status.value}
                        label="Status"
                        onChange={(e) => updateStatus(todo._id, e.target.value)}
                        disabled={loading}
                        sx={{
                          bgcolor: isDark ? '#1c1c1c' : '#fafafa',
                          color: isDark ? '#eee' : 'inherit',
                          '& .MuiSvgIcon-root': {
                            color: status.color,
                          },
                          '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          },
                        }}
                        renderValue={(selected) => {
                          const selectedStatus = statusOptions.find((s) => s.value === selected);
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <selectedStatus.Icon size={18} color={selectedStatus.color} />
                              <Typography sx={{ fontWeight: 600 }}>{selectedStatus.label}</Typography>
                            </Box>
                          );
                        }}
                      >
                        {statusOptions.map(({ value, label, color, Icon }) => (
                          <MenuItem key={value} value={value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Icon size={18} color={color} />
                              {label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Task text or edit input */}
                    <Box
                      sx={{
                        flexGrow: 1,
                        mr: 3,
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}
                    >
                      {isEditing ? (
                        <TextField
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={editedTask}
                          onChange={(e) => setEditedTask(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && editedTask.trim()) saveEditedTodo(todo._id);
                            if (e.key === 'Escape') {
                              setEditing(null);
                              setEditedTask('');
                            }
                          }}
                          autoFocus
                          aria-label={`Edit task ${todo.task}`}
                          disabled={loading}
                          sx={{
                            bgcolor: isDark ? '#1c1c1c' : '#fafafa',
                            input: { color: isDark ? '#eee' : 'inherit' },
                          }}
                        />
                      ) : (
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: status.value === 'completed' ? 'text.disabled' : 'inherit',
                            textDecoration: status.value === 'completed' ? 'line-through' : 'none',
                            userSelect: 'text',
                            whiteSpace: 'pre-wrap',
                          }}
                          aria-label={`Task: ${todo.task}`}
                        >
                          {todo.task}
                        </Typography>
                      )}
                    </Box>

                    {/* Action buttons */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                      }}
                    >
                      {isEditing ? (
                        <>
                          <Tooltip title="Save">
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => saveEditedTodo(todo._id)}
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
                              onClick={() => {
                                setEditing(null);
                                setEditedTask('');
                              }}
                              aria-label="Cancel editing"
                            >
                              Cancel
                            </Button>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Edit task">
                            <IconButton
                              onClick={() => editTodo(todo._id, todo.task)}
                              size="small"
                              aria-label={`Edit task: ${todo.task}`}
                              disabled={loading}
                            >
                              <BsFillPencilFill size={18} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete task">
                            <IconButton
                              onClick={() => confirmDelete(todo._id)}
                              size="small"
                              color="error"
                              aria-label={`Delete task: ${todo.task}`}
                              disabled={loading}
                            >
                              <BsFillTrashFill size={18} />
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

        {/* Confirm delete dialog */}
        <Dialog open={!!deleteConfirmId} onClose={cancelDelete} aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
          <DialogTitle id="delete-dialog-title" color="error">
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDelete} disabled={loading} variant="outlined" color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => deleteTodo(deleteConfirmId)}
              disabled={loading}
              variant="contained"
              color="error"
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setError('')} variant="filled" elevation={6}>
            {error}
          </Alert>
        </Snackbar>

        {/* Success Snackbar */}
        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccess('')} variant="filled" elevation={6}>
            {success}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default TodoList;
