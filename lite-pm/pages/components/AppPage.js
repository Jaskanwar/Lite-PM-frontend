import React, { Component } from "react";
import {
  Container,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

import styles from "../../styles/AppPage.module.css";

import Layout from "./Layout";
import ProjectDetails from "./ProjectDetails";
import TeamMember from "./TeamMember";
import Timeline from "./Timeline";
import MemberTimeline from "./MemberTimeline";
import ProjectDocuments from "./ProjectDocuments";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import uuid from "react-uuid";

const baseUrl = `http://localhost:5000`;

class AppPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teamMembers: [],
      memberTimelines: [],
      project: {
        projectName: "Loading",
        Description: "Loading Description",
        Duration: "Loading Duration",
        projectId: "Loading",
      },
      showAddMember: false,
      memberName: "Name",
      memberEmail: "Email",
      memberGit: "Github Link",
      memberPhone: "Phone Number",
    };

    this.addTeamMember = this.addTeamMember.bind(this);
    this.toggleAddMemberModal = this.toggleAddMemberModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.renderCreateMemberModal = this.renderCreateMemberModal.bind(this);
  }

  toggleAddMemberModal() {
    this.setState({ showAddMember: !this.state.showAddMember });
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  }

  addTeamMember() {
    this.toggleAddMemberModal();
    let members = this.state.teamMembers;
    members.push(
      <TeamMember
        key={uuid()}
        name={this.state.memberName}
        email={this.state.memberEmail}
        git={this.state.memberGit}
        phone={this.state.memberPhone}
      ></TeamMember>
    );

    let timelines = this.state.memberTimelines;
    timelines.push(
      <MemberTimeline
        key={uuid()}
        name={this.state.memberName}
      ></MemberTimeline>
    );

    const projectId = this.state.project.projectId;
    axios.post(`${baseUrl}/api/members/create`, {
      projectId: projectId,
      name: this.state.memberName,
      email: this.state.memberEmail,
      github: this.state.memberGit,
      phone: this.state.memberPhone,
    });

    this.setState({
      memberTimelines: timelines,
      teamMembers: members,
      memberName: "Name",
      memberEmail: "Email",
      memberGit: "Github Link",
      memberPhone: "Phone Number",
    });
  }

  renderCreateMemberModal() {
    return (
      <Modal
        isOpen={this.state.showAddMember}
        toggle={this.toggleAddMemberModal}
      >
        <ModalHeader>Add a Team Member</ModalHeader>
        <ModalBody className="text-center">
          <label>
            <input
              className={styles.inputs}
              name="memberName"
              type="text"
              placeholder="Name"
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            <input
              className={styles.inputs}
              name="memberEmail"
              type="text"
              placeholder="Email"
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            <input
              className={styles.inputs}
              name="memberGit"
              type="text"
              placeholder="Github Link"
              onChange={this.handleChange}
            />
          </label>
          <br />
          <label>
            <input
              className={styles.inputs}
              name="memberPhone"
              type="text"
              placeholder="Phone"
              onChange={this.handleChange}
            />
          </label>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.toggleAddMemberModal}>
            cancel
          </Button>
          <Button color="success" onClick={this.addTeamMember}>
            Add Member
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  render() {
    const commonProps = {
      apiBaseUrl: baseUrl,
      projectId: this.state?.project?.projectId,
    };
    return (
      <Layout>
        <div>
          <Container className="mt-5 mb-5">
            <ProjectDetails
              projname={this.state.project.projectName}
              description={this.state.project.Description}
              duration={this.state.project.Duration}
              projectLink={this.state.project.projectId}
            />
            <h2 className={styles.h2}>The Team</h2>
            <div className="d-flex">{this.state.teamMembers}</div>
            <Button
              color="secondary mt-2"
              className={styles.add}
              onClick={this.toggleAddMemberModal}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Member
            </Button>
            <h2 className={styles.h2}>Tasks and Timeline</h2>
            <h2 className={styles.todoHeader}>To-do</h2>
            <Timeline timelines={this.state.memberTimelines}></Timeline>

            <ProjectDocuments
              documents={this.state.project.documents}
              className="mt-5"
              {...commonProps}
            />
          </Container>

          <div>
            <this.renderCreateMemberModal />
          </div>
        </div>
      </Layout>
    );
  }
  componentDidMount() {
    let project = window.location.href.toString();
    let testcase = project.split("/projects/");
    this.setState(
      {
        projectId: testcase[1],
      },
      () => {
        this.getProjectDetails();
      }
    );
  }
  getProjectDetails = () => {
    return axios
      .get(`${baseUrl}/api/project/get/${this.state.projectId}`, {})
      .then(
        (res) => {
          this.setState(
            {
              project: res.data,
            },
            () => {
              console.log(this.state.project.Member);
            }
          );
        },
        (err) => {
          console.log(err);
        }
      );
  };
  assignTask(userId) {
    const projectId = this.state.project.projectId;
    let startTime = Math.round(new Date().getTime() / 1000);
    axios
      .post(`${baseUrl}/api/tasks/assign`, {
        projectId: projectId,
        userId: userId,
        startTime: startTime,
      })
      .then(
        (res) => {
          this.setState({
            project: res.data,
          });
        },
        (err) => {
          console.log(err);
        }
      );
  };
  editTask(taskId, title, duration, durationType, description) {
    const projectId = this.state.project.projectId;
    if (durationType === 0) {
      duration = duration * 3600;
    } else {
      duration = duration * 86400;
    }
    axios
      .post(`${baseUrl}/api/tasks/assign`, {
        projectId: projectId,
        taskId: taskId,
        duration: duration,
        title: title,
        description: description
      })
      .then(
        (res) => {
          this.setState({
            project: res.data,
          });
        },
        (err) => {
          console.log(err);
        }
      );
  }
  compeleteTask(userId) {
    const projectId = this.state.project.projectId;
    axios
      .post(`${baseUrl}/api/tasks/complete`, {
        projectId: projectId,
        userId: userId,
      })
      .then(
        (res) => {
          this.setState({
            project: res.data,
          });
        },
        (err) => {
          console.log(err);
        }
      );
  };
  deleteTask(taskId) {
    const projectId = this.state.project.projectId;
    axios
      .post(`${baseUrl}/api/tasks/delete`, {
        projectId: projectId,
        taskId: taskId,
      })
      .then(
        (res) => {
          this.setState({
            project: res.data,
          });
        },
        (err) => {
          console.log(err);
        }
      );
  }
}

export default AppPage;
