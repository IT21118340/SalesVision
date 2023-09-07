import { MDBDataTable } from "mdbreact";
import React, { Fragment, useEffect } from "react";
import { Link } from "react-router-dom";

import jsPDF from "jspdf";
import "jspdf-autotable";

import Loader from "../layout/Loader";
import MetaData from "../layout/MetaData";
import Sidebar from "./Sidebar";

import { useAlert } from "react-alert";
import { useDispatch, useSelector } from "react-redux";
import {
	clearErrors,
	deleteSupplier,
	getAdminSuppliers,
} from "../../actions/supplierActions";
import { DELETE_SUPPLIER_RESET } from "../../constants/supplierConstants";

const SuppliersList = ({ history }) => {
	const alert = useAlert();
	const dispatch = useDispatch();

	const { loading, error, suppliers } = useSelector(
		(state) => state.suppliers
	);
	const { error: deleteError, isDeleted } = useSelector(
		(state) => state.supplier
	);

	useEffect(() => {
		dispatch(getAdminSuppliers());

		if (error) {
			alert.error(error);
			dispatch(clearErrors());
		}

		if (deleteError) {
			alert.error(deleteError);
			dispatch(clearErrors());
		}

		if (isDeleted) {
			alert.success("Supplier deleted successfully");
			history.push("/admin/suppliers");
			dispatch({ type: DELETE_SUPPLIER_RESET });
		}
	}, [dispatch, alert, error, deleteError, isDeleted, history]);

	const setSuppliers = () => {
		const data = {
			columns: [
				{
					label: "ID",
					field: "id",
					sort: "asc",
				},
				{
					label: "Name",
					field: "name",
					sort: "asc",
				},
				{
					label: "Phone Number",
					field: "phoneNumber",
					sort: "asc",
				},
				{
					label: "Email",
					field: "email",
					sort: "asc",
				},
				{
					label: "Actions",
					field: "actions",
				},
			],
			rows: [],
		};

		suppliers.forEach((supplier) => {
			data.rows.push({
				id: supplier._id,
				name: supplier.name,
				phoneNumber: supplier.phoneNumber,
				email: supplier.email,
				actions: (
					<Fragment>
						<Link
							to={`/admin/supplierProductList/${supplier._id}`}
							className="btn btn-success py-1 px-2"
						>
							<i className="fa fa-list"></i>
						</Link>
						<Link
							to={`/admin/supplier/${supplier._id}`}
							className="btn btn-primary py-1 px-2 ml-3"
						>
							<i className="fa fa-pencil"></i>
						</Link>
						<button
							className="btn btn-danger py-1 px-2 ml-3"
							onClick={() => deleteSupplierHandler(supplier._id)}
						>
							<i className="fa fa-trash"></i>
						</button>
					</Fragment>
				),
			});
		});

		return data;
	};

	const deleteSupplierHandler = (id) => {
		dispatch(deleteSupplier(id));
	};

	//generate pdf
	const generatePDF = () => {
		const doc = new jsPDF();
		const tableRows = [];

		// Add title
		const title = `NextLevel - Supplier List - (${new Date().toLocaleDateString()})`;
		const titleX = doc.internal.pageSize.getWidth() / 2;
		doc.setFontSize(16);
		doc.text(titleX, 20, title, "center");

		// Add gap
		const gap = 5;
		let y = 20;

		// Add table headers
		const headers = ["ID", "Name", "Phone Number", "Email"];
		tableRows.push(headers);

		// Add table data
		suppliers.forEach((suppliers) => {
			const supplierData = [
				suppliers._id,
				suppliers.name,
				suppliers.phoneNumber,
				suppliers.email,
			];
			tableRows.push(supplierData);
		});

		// Add table to PDF document
		doc.autoTable({
			head: [tableRows[0]],
			body: tableRows.slice(1),
			startY: y + gap,
		});

		// Save PDF file
		doc.save("Suppliers.pdf");
	};

	return (
		<Fragment>
			<MetaData title={"All Suppliers"} />
			<div className="row">
				<div className="col-12 col-md-2">
					<Sidebar />
				</div>

				<div className="col-12 col-md-10">
					<Fragment>
						<h1 className="my-5">All Suppliers</h1>
						<button
							className="btn btn-info py-1 px-2 ml-2"
							onClick={generatePDF}
						>
							<i className="fa fa-file-pdf-o"></i> Download Reports
						</button>

						{loading ? (
							<Loader />
						) : (
							<MDBDataTable
								data={setSuppliers()}
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

export default SuppliersList;
