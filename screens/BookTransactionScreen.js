import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { TextInput } from 'react-native-gesture-handler';
import db from "../Config";
import firebase from 'firebase';


export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookID: '',
        scannedStudentID:'',
        buttonState: 'normal',
        transactionmessage: '' 
      }
    }

    getCameraPermissions = async (data) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        hasCameraPermissions: status === "granted",
        buttonState: data,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const buttonState = this.state.buttonState
      if (buttonState === "BOOK ID"){
      this.setState({
        scanned: true,
        scannedBookID: data,
        buttonState: 'normal'
      });
      }
      if (buttonState === "STUDENT ID"){
        this.setState({
          scanned: true,
          scannedStudentID: data,
          buttonState: 'normal'
        });
        }
    }

    handleTransaction = async()=>{
      var transactionMessage 
      db.collection("BOOKS").doc(this.state.scannedBookID).get()
      .then(doc => {
        var book = doc.data()
        if (book.Status === true){
          transactionMessage = "Issued";
          this.bookIssue();
        }
        else{
          transactionMessage = "Return"
          this.Return();
        }
      })
      this.setState({
        transactionmessage: transactionMessage,
      })

    }
    bookIssue = async()=>{
      db.collection("BOOKS").doc(this.state.scannedBookID).update({
        Status: false
      })
      db.collection("STUDENTS").doc(this.state.scannedStudentID).update({
      Books_Taken: firebase.firestore.FieldValue.increment(1)
      })
      db.collection("TRANSACTION").add({
        StudentID:this.state.scannedStudentID,
        BookID: this.state.scannedBookID,
        Date: firebase.firestore.Timestamp.now().toDate(),
        TransactionType: "Issued"
      })
      alert("Book is issued")
    }
    Return = async()=>{
      db.collection("BOOKS").doc(this.state.scannedBookID).update({
        Status: true
      })
      db.collection("STUDENTS").doc(this.state.scannedStudentID).update({
      Books_Taken: firebase.firestore.FieldValue.increment(-1)
      })
      db.collection("TRANSACTION").add({
        StudentID:this.state.scannedStudentID,
        BookID: this.state.scannedBookID,
        Date: firebase.firestore.Timestamp.now().toDate(),
        TransactionType: "Return"
      })
      alert("Book is returned");
    }
     
    



    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <View style={styles.container}>

          <View style={styles.inputView}>
            <TextInput styles = {styles.inputBox} placeholder = {"BOOK ID"} value = {this.state.scannedBookID} onChangeText = {Text => {
              this.setState({scannedBookID:Text})
            }}>

            </TextInput>
            <TouchableOpacity style = {styles.scanButton} onPress = {()=>{this.getCameraPermissions("BOOK ID")}} >
              <Text styles = {styles.buttonText}>
                SCAN
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput styles = {styles.inputBox} placeholder = {"STUDENT ID"} value = {this.state.scannedStudentID} onChangeText = {Text => {
              this.setState({scannedStudentID:Text})
            }}>

            </TextInput>
            <TouchableOpacity style = {styles.scanButton} onPress = {()=>{this.getCameraPermissions("STUDENT ID")}}>
              <Text styles = {styles.buttonText}>
                SCAN
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity onPress = {()=>
            this.handleTransaction()
            }>
              <Text>
                SUBMIT
              </Text>
            </TouchableOpacity>
          </View>
          </View>
        );
      }
    }
  }
  
  const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
    displayText:{ fontSize: 15, textDecorationLine: 'underline' }, 
    scanButton:{ backgroundColor: '#2196F3', padding: 10, margin: 10 }, 
    buttonText:{ fontSize: 15, textAlign: 'center', marginTop: 10 }, 
    inputView:{ flexDirection: 'row', margin: 20 },
    inputBox:{ width: 200, height: 40, borderWidth: 1.5, borderRightWidth: 0, fontSize: 20 }, 
    scanButton:{ backgroundColor: '#66BB6A', width: 50, borderWidth: 1.5, borderLeftWidth: 0 } });