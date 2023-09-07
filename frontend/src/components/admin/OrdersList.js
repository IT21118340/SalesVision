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
import {
	allOrders,
	clearErrors,
	deleteOrder,
} from "../../actions/orderActions";
import { DELETE_ORDER_RESET } from "../../constants/orderConstants";

const OrdersList = ({ history }) => {
	const alert = useAlert();
	const dispatch = useDispatch();

	const { loading, error, orders } = useSelector((state) => state.allOrders);
	const { isDeleted } = useSelector((state) => state.order);

	useEffect(() => {
		dispatch(allOrders());

		if (error) {
			alert.error(error);
			dispatch(clearErrors());
		}

		if (isDeleted) {
			alert.success("Order deleted successfully");
			history.push("/admin/orders");
			dispatch({ type: DELETE_ORDER_RESET });
		}
	}, [dispatch, alert, error, isDeleted, history]);

	const deleteOrderHandler = (id) => {
		dispatch(deleteOrder(id));
	};

	const setOrders = () => {
		const data = {
			columns: [
				{
					label: "Order ID",
					field: "id",
					sort: "asc",
				},
				{
					label: "No of Items",
					field: "numofItems",
					sort: "asc",
				},
				{
					label: "Amount",
					field: "amount",
					sort: "asc",
				},
				{
					label: "Status",
					field: "status",
					sort: "asc",
				},
				{
					label: "Actions",
					field: "actions",
				},
			],
			rows: [],
		};

		orders.forEach((order) => {
			data.rows.push({
				id: order._id,
				numofItems: order.orderItems.length,
				amount: `Rs${order.totalPrice}`,
				status:
					order.orderStatus &&
					String(order.orderStatus).includes("Delivered") ? (
						<p style={{ color: "green" }}>{order.orderStatus}</p>
					) : (
						<p style={{ color: "red" }}>{order.orderStatus}</p>
					),
				actions: (
					<Fragment>
						<Link
							to={`/admin/order/${order._id}`}
							className="btn btn-primary py-1 px-2"
						>
							<i className="fa fa-eye"></i>
						</Link>
						<button
							className="btn btn-danger py-1 px-2 ml-3"
							onClick={() => deleteOrderHandler(order._id)}
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
		const title = `NextLevel - Order List - (${new Date().toLocaleDateString()})`;
		const titleX = doc.internal.pageSize.getWidth() / 2;
		doc.setFontSize(16);
		doc.text(titleX, 20, title, "center");

		// Add gap
		const gap = 5;
		let y = 20;

		// Add table headers
		const headers = ["ID", "No Of Items", "Amount", "Status"];
		tableRows.push(headers);

		// Add table data
		orders.forEach((orders) => {
			const productData = [
				orders._id,
				orders.orderItems.length,
				`Rs${orders.totalPrice}`,
				orders.orderStatus &&
					String(orders.orderStatus).includes("Delivered"),
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
		doc.save("Order.pdf");
	};

	return (
		<Fragment>
			<MetaData title={"All Orders"} />
			<div className="row">
				<div className="col-12 col-md-2">
					<Sidebar />
				</div>

				<div className="col-12 col-md-10">
					<Fragment>
						<h1 className="my-5">All Orders</h1>
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
								data={setOrders()}
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

export default OrdersList;
