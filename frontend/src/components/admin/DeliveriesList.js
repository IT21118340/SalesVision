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
	deleteDelivery,
	getAdminDeliveries,
} from "../../actions/deliveryActions";
import { DELETE_DELIVERY_RESET } from "../../constants/deliveryConstants";

const DeliveriesList = ({ history }) => {
	const alert = useAlert();
	const dispatch = useDispatch();

	const { loading, error, deliveries } = useSelector(
		(state) => state.deliveries
	);
	const { error: deleteError, isDeleted } = useSelector(
		(state) => state.deliveries
	);

	useEffect(() => {
		dispatch(getAdminDeliveries());

		if (error) {
			alert.error(error);
			dispatch(clearErrors());
		}

		if (deleteError) {
			alert.error(deleteError);
			dispatch(clearErrors());
		}

		if (isDeleted) {
			alert.success("Delivery deleted successfully");
			history.push("/admin/deliveries");
			dispatch({ type: DELETE_DELIVERY_RESET });
		}
	}, [dispatch, alert, error, deleteError, isDeleted, history]);

	const setDeliveries = () => {
		const data = {
			columns: [
				{
					label: "ID",
					field: "id",
					sort: "asc",
				},
				{
					label: "Customer Name",
					field: "name",
					sort: "asc",
				},
				{
					label: "Address",
					field: "adress",
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
					label: "Delivered By",
					field: "diliveryPerson",
					sort: "asc",
				},
				{
					label: "Actions",
					field: "actions",
				},
			],
			rows: [],
		};

		deliveries.forEach((delivery) => {
			data.rows.push({
				id: delivery._id,
				name: delivery.name,
				adress: delivery.adress,
				phoneNumber: delivery.phoneNumber,
				email: delivery.email,
				diliveryPerson: delivery.diliveryPerson,
				actions: (
					<Fragment>
						<Link
							to={`/admin/delivery/${delivery._id}`}
							className="btn btn-primary py-1 px-2"
						>
							<i className="fa fa-pencil"></i>
						</Link>
						<button
							className="btn btn-danger py-1 px-2 ml-3"
							onClick={() => deleteDeliveryHandler(delivery._id)}
						>
							<i className="fa fa-trash"></i>
						</button>
					</Fragment>
				),
			});
		});

		return data;
	};

	const deleteDeliveryHandler = (id) => {
		dispatch(deleteDelivery(id));
	};

	//generate pdf
	const generatePDF = () => {
		const doc = new jsPDF();
		const tableRows = [];

		// Add title
		const title = `NextLevel - Delivery List - (${new Date().toLocaleDateString()})`;
		const titleX = doc.internal.pageSize.getWidth() / 2;
		doc.setFontSize(16);
		doc.text(titleX, 20, title, "center");

		// Add gap
		const gap = 5;
		let y = 20;

		// Add table headers
		const headers = [
			"ID",
			"Name",
			"Address",
			"Phone Number",
			"Email",
			"DeliveryPerson",
		];
		tableRows.push(headers);

		// Add table data
		deliveries.forEach((deliveries) => {
			const productData = [
				deliveries._id,
				deliveries.name,
				deliveries.adress,
				deliveries.phoneNumber,
				deliveries.email,
				deliveries.diliveryPerson,
			];
			tableRows.push(productData);
		});

		// Add table to PDF document
		doc.autoTable({
			head: [tableRows[0]],
			body: tableRows.slice(1),
			startY: y + gap,
		});

		// Save PDF file
		doc.save("Deliveries.pdf");
	};

	return (
		<Fragment>
			<MetaData title={"All Deliveries"} />
			<div className="row">
				<div className="col-12 col-md-2">
					<Sidebar />
				</div>

				<div className="col-12 col-md-10">
					<Fragment>
						<h1 className="my-5">All Deliveries</h1>
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
								data={setDeliveries()}
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

export default DeliveriesList;
