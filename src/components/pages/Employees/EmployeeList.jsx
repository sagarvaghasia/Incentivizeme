import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid';
import { Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';


function AddToolbar(props) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFormSubmit = (values) => {
    const newRow = {
      id: uuidv4(),
      name: values.name,
      wage: values.wage,
      email: values.email,
      phoneNumber: values.phoneNumber,
    };

    fetch('https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/employees', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRow),
    })
      .then((res) => res.json())
      .then((data) => {
        props.updateTableData([data, ...props.tableData]);
      })
      .catch((error) => {
        console.error('Error adding employee: ', error);
      });
    handleClose();
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClickOpen}>
        Add
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{ name: '' }}
            validationSchema={Yup.object().shape({
              name: Yup.string().required('Name is required'),
              email: Yup.string().email('Invalid email').required('Email is required'),
              phoneNumber: Yup.string().required('Phone number is required'),
              wage: Yup.number().required('Wage is required'),
            })}
            onSubmit={handleFormSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <Box sx={{ mb: 2 }}>
                  <Field
                    name="name"
                    label="Name"
                    variant="outlined"
                    as={TextField}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    fullWidth
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Field
                    name="wage"
                    label="Wage"
                    variant="outlined"
                    as={TextField}
                    type="number"
                    error={touched.wage && Boolean(errors.wage)}
                    helperText={touched.wage && errors.wage}
                    fullWidth
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Field
                    name="email"
                    label="Email"
                    variant="outlined"
                    as={TextField}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    fullWidth
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Field
                    name="phoneNumber"
                    label="Phone Number"
                    variant="outlined"
                    as={TextField}
                    error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                    helperText={touched.phoneNumber && errors.phoneNumber}
                    fullWidth
                  />
                </Box>
                <DialogActions>
                  <Button variant="text" startIcon={<CancelIcon />} onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" startIcon={<SaveIcon />} type="submit">
                    Save
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </GridToolbarContainer>
  );
}

const EmployeeList = () => {
  // const tab1 = [{"id": "342c012f-066b-4281-a532-c566e72d7371", "name": "dwsdsdssdfddyu"}]
  // const [tableData, setTableData] = useState(tab1)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [tableData, setTableData] = useState([])
  useEffect(() => {
    fetch('https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/employees')
      .then((data) => data.json())
      .then((data) => setTableData(data));
  }, []);

  const handleEdit = (row) => {
    console.log(`Editing row with id ${row.id}`);
    setSelectedRow(row);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setSelectedRow(null);
    setEditDialogOpen(false);
  }

  const handleDelete = (row) => {
    fetch(`https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/employees/${row.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.status === 400) {
          alert('An error occurred while deleting the row. Please check if the provided key element matches the schema.');
        } else {
          const updatedTableData = tableData.filter((data) => data.id !== row.id);
          setTableData(updatedTableData);
        }
      })
      .catch((error) => {
        console.error(`Error deleting row with id ${row.id}: `, error);
        alert('An error occurred while deleting the row. Please try again later.');
      })
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 180, editable: false },
    { field: 'wage', headerName: 'Wage', width: 180, editable: false },
    { field: 'email', headerName: 'Email', width: 180, editable: false },
    { field: 'phoneNumber', headerName: 'phoneNumber', width: 180, editable: false },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      editable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const handleEditClick = () => {
          handleEdit(params.row);
        };

        const handleDeleteClick = () => {
          handleDelete(params.row);
        };

        return (
          <>
            <Button
              color="primary"
              size="small"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
            />
            <Button
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
            />
          </>
        );
      },
    },
  ];

  const handleEditFormSubmit = (values) => {
    fetch('https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/employees', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((response) => {
        const updatedTableData = tableData.map((data) => {
          if (data.id === selectedRow.id) {
            return response;
          } else {
            return data;
          }
        });
        setTableData(updatedTableData);
      })
      .catch((error) => {
        console.error('Error updating employee : ', error);
      });
    handleEditDialogClose();
  };

  return (
    <Box sx={{ height: 700, width: '100%' }}>
      <DataGrid
        rows={tableData}
        columns={columns}
        pageSize={5}
        disableSelectionOnClick
        slots={{
          toolbar: (props) => (
            <AddToolbar
              updateTableData={setTableData}
              tableData={tableData}
              {...props}
            />
          ),
        }}

      />
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={selectedRow}
            validationSchema={Yup.object().shape({
              name: Yup.string().required('Name is required'),
              email: Yup.string().email('Invalid email').required('Email is required'),
              phoneNumber: Yup.string().required('Phone number is required'),
              wage: Yup.number().required('Wage is required'),
            })}
            onSubmit={handleEditFormSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <Box sx={{ mb: 2 }}>
                  <Field
                    name="name"
                    label="Name"
                    variant="outlined"
                    as={TextField}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    fullWidth
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Field
                    name="wage"
                    label="Wage"
                    variant="outlined"
                    as={TextField}
                    type="number"
                    error={touched.wage && Boolean(errors.wage)}
                    helperText={touched.wage && errors.wage}
                    fullWidth
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Field
                    name="email"
                    label="Email"
                    variant="outlined"
                    as={TextField}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    fullWidth
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Field
                    name="phoneNumber"
                    label="Phone Number"
                    variant="outlined"
                    as={TextField}
                    error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                    helperText={touched.phoneNumber && errors.phoneNumber}
                    fullWidth
                  />
                </Box>
                <DialogActions>
                  <Button variant="text" startIcon={<CancelIcon />} onClick={handleEditDialogClose}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" startIcon={<SaveIcon />} type="submit">
                    Save
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EmployeeList;