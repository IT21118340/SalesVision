import { MDBDataTable } from "mdbreact";
import React, { Fragment, useEffect } from "react";
import { Link } from "react-router-dom";

import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import Sidebar from "./Sidebar";

import jsPDF from "jspdf";
import "jspdf-autotable";

import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import { allUsers, clearErrors, deleteUser } from "../../actions/userActions";
import { DELETE_USER_RESET } from "../../constants/userConstants";

const UsersList = ({ history }) => {
	const alert = useAlert();
	const dispatch = useDispatch();

	const { loading, error, users } = useSelector((state) => state.allUsers);
	const { isDeleted } = useSelector((state) => state.user);

	useEffect(() => {
		dispatch(allUsers());

		if (error) {
			alert.error(error);
			dispatch(clearErrors());
		}

		if (isDeleted) {
			alert.success("User deleted successfully");
			history.push("/admin/users");
			dispatch({ type: DELETE_USER_RESET });
		}
	}, [dispatch, alert, error, isDeleted, history]);

	const deleteUserHandler = (id) => {
		dispatch(deleteUser(id));
	};

	const setUsers = () => {
		const data = {
			columns: [
				{
					label: "User ID",
					field: "id",
					sort: "asc",
				},
				{
					label: "Name",
					field: "name",
					sort: "asc",
				},
				{
					label: "Email",
					field: "email",
					sort: "asc",
				},
				{
					label: "Role",
					field: "role",
					sort: "asc",
				},
				{
					label: "Actions",
					field: "actions",
				},
			],
			rows: [],
		};

		users.forEach((user) => {
			data.rows.push({
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,

				actions: (
					<Fragment>
						<Link
							to={`/admin/user/${user._id}`}
							className="btn btn-primary py-1 px-2"
						>
							<i className="fa fa-pencil"></i>
						</Link>
						<button
							className="btn btn-danger py-1 px-2 ml-3"
							onClick={() => deleteUserHandler(user._id)}
						>
							<i className="fa fa-trash"></i>
						</button>
					</Fragment>
				),
			});
		});

		return data;
	};

	//generate pdf
	const generatePDF = () => {
		const doc = new jsPDF();
		const tableRows = [];

		// Add title
		const title = `NextLevel - User List - (${new Date().toLocaleDateString()})`;
		const titleX = doc.internal.pageSize.getWidth() / 2;
		doc.setFontSize(16);
		doc.text(titleX, 20, title, "center");

		// Add gap
		const gap = 5;
		let y = 20;

		// Add table headers
		const headers = ["ID", "Name", "Email", "Role"];
		tableRows.push(headers);

		// Add table data
		users.forEach((users) => {
			const userData = [users._id, users.name, users.email, users.role];
			tableRows.push(userData);
		});

		// Add table to PDF document
		doc.autoTable({
			head: [tableRows[0]],
			body: tableRows.slice(1),
			startY: y + gap,
		});

		// Save PDF file
		doc.save("User.pdf");
	};

	return (
		<Fragment>
			<MetaData title={"All Users"} />
			<div className="row">
				<div className="col-12 col-md-2">
					<Sidebar />
				</div>

				<div className="col-12 col-md-10">
					<Fragment>
						<h1 className="my-5">All Users</h1>
						<button
							className="btn btn-info py-1 px-2 ml-3"
							onClick={generatePDF}
						>
							<i className="fa fa-file-pdf-o"></i> Download Reports
						</button>

						{loading ? (
							<Loader />
						) : (
							<MDBDataTable
								data={setUsers()}
								className="px-3"
								bordered
								striped
								hover
							/>
						)}
					</Fragment>
				</div>
			</div>
		</Fragment>
	);
};

export default UsersList;
