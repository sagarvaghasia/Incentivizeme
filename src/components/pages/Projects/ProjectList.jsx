import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, InputAdornment, TextField, FormControl, InputLabel, Select } from '@mui/material';
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid';
import { Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';
import { StatusButtonGroup } from '../../ButtonGroup';


function AddToolbar(props) {
  const [open, setOpen] = useState(false);
  const [managerList, setmanagerList] = useState([]);

  useEffect(() => {
    fetch('https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/employees')
      .then((response) => response.json())
      .then((data) => setmanagerList(data));
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFormSubmit = (values) => {
    const { selectedManager } = values;
    const newRow = {
      id: uuidv4(),
      status: 'pending',
      managerId: selectedManager,
      name: values.name,
      budgetAmount: values.budgetAmount
    };

    fetch('https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/projects/create', {
      method: 'POST',
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
        console.error('Error adding project: ', error);
      });
    handleClose();
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClickOpen}>
        Add
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Project</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{ name: '', budgetAmount: 0 }}
            validationSchema={Yup.object().shape({
              name: Yup.string().required('Name is required'),
              budgetAmount: Yup.number().required('Budget is required'),
              managerId: Yup.string().required('Please select manager'),
            })}
            onSubmit={handleFormSubmit}
          >
            {({ errors, touched, values, setFieldValue, handleBlur }) => (
              <Form>
                <Box sx={{ mb: 2, mt: 2 }}>
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
                    name="budgetAmount"
                    label="Budget"
                    type="number"
                    variant="outlined"
                    as={TextField}
                    error={touched.budgetAmount && Boolean(errors.budgetAmount)}
                    helperText={touched.budgetAmount && errors.budgetAmount}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    fullWidth
                  />
                </Box>
                <Box x={{ mb: 2 }} >
                  <FormControl fullWidth>
                    <InputLabel htmlFor="managerId">Manager</InputLabel>
                    <Select
                      labelId="managerId"
                      id="managerId"
                      name="managerId"
                      label="Manager"
                      value={values.managerId}
                      onChange={(event) => {
                        const value = event.target.value;
                        const selectedManager = managerList.find((employee) => employee.id === value);
                        setFieldValue("selectedManager", selectedManager || {});
                        setFieldValue("managerId", value);
                      }}
                      onBlur={handleBlur}
                      error={touched.managerId && Boolean(errors.managerId)}
                      helperText={touched.managerId && errors.managerId}

                    >
                      <MenuItem value="">Select manager</MenuItem>
                      {managerList.map((employee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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

const ProjectList = () => {
  const [tableData, setTableData] = useState([])
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  useEffect(() => {
    fetch('https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/projects')
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
    fetch(`https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/projects/${row.id}`, {
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
    { field: 'name', headerName: 'Name', width: 180, editable: true },
    {
      field: 'budgetAmount', headerName: 'Budget Amount', width: 180,
      renderCell: (params) => (
        <div>$ {params.value || 0} </div>
      )
    },
    { field: 'managerId', width: 190, headerName: 'Manager', editable: false, valueGetter: (params) => params.row.managerId && params.row.managerId.name },
    {
      field: 'status',
      headerName: 'Status',
      width: 200,
      renderCell: (params) => {
        const loading = false;
        const handleApproveClick = () => {
          const updatedTableData = tableData.map((data) => {
            if (data.id === params.row.id) {
              return { ...data, status: 'approve' };
            } else {
              return data;
            }
          });
          setTableData(updatedTableData);
          fetch('https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/approveproject', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: params.row.id }),
          })
            .then((res) => res.json())
            .then((data) => {
              const updatedTableData = tableData.map((data) => {
                if (data.id === params.row.id) {
                  return { ...data, status: 'approve' };
                } else {
                  return data;
                }
              });
              setTableData(updatedTableData);
            })
            .catch((error) => {
              console.error('Error approving employee : ', error);
            });
        };

        const handlePendingClick = () => {
          fetch('https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/markpendingproject', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: params.row.id }),
          })
            .then((res) => res.json())
            .then((data) => {
              const updatedTableData = tableData.map((data) => {
                if (data.id === params.row.id) {
                  return { ...data, status: 'pending' };
                } else {
                  return data;
                }
              });
              setTableData(updatedTableData);
            })
            .catch((error) => {
              console.error('Error marking project as pending : ', error);
            });
        };
        return (
          <>
            {params.row.status === 'pending' && <StatusButtonGroup
              onClick={handleApproveClick}
              variant='outlined'
              reverseVariant='contained'
              loading={loading}
              reverseLoading={false}
              style={{}}
              buttonsTitle={{ button1: 'Pending', button2: 'Approve' }}
              reverseStyle={{ backgroundColor: '#faa734', color: 'white' }} />}
            {params.row.status === 'approve' &&
              <StatusButtonGroup
                onClick={handlePendingClick}
                variant='contained'
                reverseVariant='outlined'
                loading={loading}
                reverseLoading={false}
                style={{ backgroundColor: '#3ab077', color: 'white' }}
                buttonsTitle={{ button1: 'Pending', button2: 'Approved' }}
                reverseStyle={{}} />
            }
          </>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
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
    }
  ];

  const handleEditFormSubmit = (values) => {
    fetch('https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/projects', {
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
        console.error('Error updating project: ', error);
      });
    handleEditDialogClose();
  };

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={tableData}
        columns={columns}
        pageSize={5}
        checkboxSelection={false}
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
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{ id: selectedRow?.id, status: selectedRow?.status, name: selectedRow?.name, budgetAmount: selectedRow?.budgetAmount, managerId: selectedRow?.managerId }}
            validationSchema={Yup.object().shape({
              name: Yup.string().required('Name is required'),
              budgetAmount: Yup.string().required('Budget is required'),
            })}
            onSubmit={handleEditFormSubmit}
          >
            {({ errors, touched, values }) => (
              <Form>
                <Box sx={{ mb: 2, mt: 4 }}>
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
                    name="budgetAmount"
                    label="Budget"
                    type="number"
                    variant="outlined"
                    as={TextField}
                    error={touched.budgetAmount && Boolean(errors.budgetAmount)}
                    helperText={touched.budgetAmount && errors.budgetAmount}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
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

export default ProjectList;