import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { DataGrid, GridDeleteIcon, GridToolbarContainer } from '@mui/x-data-grid';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';

function AddToolbar(props) {
    const [open, setOpen] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);
    const [projectList, setProjectList] = useState([]);

    useEffect(() => {
        fetch('https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/employees')
            .then((response) => response.json())
            .then((data) => setEmployeeList(data));
    }, []);

    useEffect(() => {
        fetch('https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/projects')
            .then((response) => response.json())
            .then((data) => setProjectList(data));
    }, []);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const calculateHours = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const hours = Math.abs(end - start) / 36e5;
        return hours;
    };

    const handleFormSubmit = (values) => {
        const { selectedEmployee, selectedProject, startDate, endDate } = values;
        const newRow = {
            id: uuidv4(),
            employeeId: selectedEmployee,
            projectId: selectedProject,
            startDate: startDate,
            endDate: endDate,
            hours: calculateHours(startDate, endDate),
        };
        fetch('https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/attendances/create', {
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
                <DialogTitle>New Attendance</DialogTitle>
                <DialogContent>
                    <Formik
                        initialValues={{ selectedEmployee: {}, employeeId: "", selectedProject: {}, projectId: "", }}
                        validationSchema={Yup.object().shape({
                            employeeId: Yup.string().required('Employee is required'),
                            projectId: Yup.string().required('Project is required'),
                            startDate: Yup.date().required('Start date is required'),
                            endDate: Yup.date().required("End date is required").test(
                                "endDate",
                                "End date must be greater than start date",
                                function (value) {
                                    const { startDate } = this.parent;
                                    return startDate && value && startDate.getTime() < value.getTime();
                                }
                            ),
                        })}
                        onSubmit={handleFormSubmit}
                    >
                        {({ errors, touched, values, setFieldValue, setFieldTouched, handleBlur }) => (
                            <Form>
                                <Box >
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="employeeId">Employee:</InputLabel>
                                        <Select
                                            labelId="employeeId"
                                            id="employeeId"
                                            name="employeeId"
                                            label="Employee"
                                            value={values.employeeId}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                const selectedEmployee = employeeList.find((employee) => employee.id === value);
                                                setFieldValue("selectedEmployee", selectedEmployee || {});
                                                setFieldValue("employeeId", value);
                                            }}
                                            onBlur={handleBlur}
                                            error={touched.employeeId && Boolean(errors.employeeId)}
                                            helperText={touched.employeeId && errors.employeeId}

                                        >
                                            <MenuItem value="">Select an employee</MenuItem>
                                            {employeeList.map((employee) => (
                                                <MenuItem key={employee.id} value={employee.id}>
                                                    {employee.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box mt={2}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="projectId">Projects:</InputLabel>
                                        <Select
                                            labelId="projectId"
                                            id="projectId"
                                            name="projectId"
                                            label="Project"
                                            value={values.projectId}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                const selectedProject = projectList.find((project) => project.id === value);
                                                setFieldValue("selectedProject", selectedProject || {});
                                                setFieldValue("projectId", value);
                                            }}
                                            onBlur={handleBlur}
                                            error={touched.projectId && Boolean(errors.projectId)}
                                            helperText={touched.projectId && errors.projectId}

                                        >
                                            <MenuItem value="">Select project</MenuItem>
                                            {projectList.map((project) => (
                                                <MenuItem key={project.id} value={project.id}>
                                                    {project.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Box mt={2}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <DateTimePicker
                                                    label="Start Date"
                                                    inputFormat="MM/dd/yyyy hh:mm a"
                                                    value={values.startDate}
                                                    onChange={(date) => setFieldValue("startDate", date)}
                                                    onBlur={() => setFieldTouched("startDate", true)}
                                                    renderInput={(params) => (
                                                        <TextField {...params} variant="outlined" />
                                                    )}

                                                    error={touched.startDate && Boolean(errors.startDate)}
                                                    helperText={touched.startDate && errors.startDate}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <DateTimePicker
                                                    label="End Date"
                                                    inputFormat="MM/dd/yyyy hh:mm a"
                                                    value={values.endDate}
                                                    onChange={(date) => setFieldValue("endDate", date)}
                                                    renderInput={(params) => (
                                                        <TextField {...params} variant="outlined" />
                                                    )}
                                                    onBlur={handleBlur}
                                                    error={touched.endDate && Boolean(errors.endDate)}
                                                    helperText={touched.endDate && errors.endDate}

                                                />
                                            </Grid>
                                        </Grid>
                                    </LocalizationProvider>
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

const AttendanceList = () => {
    const [tableData, setTableData] = useState([])

    useEffect(() => {
        fetch('https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/attendances')
            .then((data) => data.json())
            .then((data) => {
                setTableData(data)
            });
    }, []);

    const handleDelete = (row) => {
        fetch(`https://v4n79094h8.execute-api.us-east-1.amazonaws.com/dev/attendances/${row.id}`, {
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
        { field: 'employeeId', width: 190, headerName: 'Employee', editable: false, valueGetter: (params) => params.row.employeeId && params.row.employeeId.name },
        { field: 'projectId', width: 190, headerName: 'Project', editable: false, valueGetter: (params) => params.row.projectId && params.row.projectId.name },
        {
            field: 'startDate',
            headerName: 'Start Date',
            width: 190,
            editable: false,
            valueGetter: (params) => new Date(params.row.startDate).toLocaleString(),
        },
        {
            field: 'endDate',
            width: 190,
            headerName: 'End Date',
            editable: false,
            valueGetter: (params) => new Date(params.row.endDate).toLocaleString(),
        },
        {
            field: 'hours',
            headerName: 'Hours',
            width: 190,
            editable: false,
        },
        { field: 'Bonus', width: 190, headerName: 'Bonus', editable: false, valueFormatter: (params) => {
            const value = parseFloat(params.value);
            return value?`$${value.toFixed(2)}`:'$0.0';
          }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            editable: false,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
              const handleDeleteClick = () => {
                handleDelete(params.row);
              };
              return (
                <>
                  <Button
                    color="error"
                    size="small"
                    startIcon={<GridDeleteIcon />}
                    onClick={handleDeleteClick}
                  />
                </>
              );
            },
          },
    ];

    return (
        <Box sx={{ height: 800, width: '100%' }}>
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
        </Box>
    );
};

export default AttendanceList;