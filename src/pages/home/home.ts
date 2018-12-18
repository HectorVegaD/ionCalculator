import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  //Variables used for construction of UI
  colOffset = [0, 1, 2];
  operators = ['/', '*', '+/-'];
  finalRow = ['.', '='];
  items = [{row: 7, op: "+"}, {row: 4, op: "-"}, {row: 1, op: "AC"}];
  
  //Two operands and operator
  inputFocus = '0';
  sum = null;
  operator1 = null;

  //Help determine state of inputFocus operand
  lookingForNewInput: boolean;
  deletableDigits: boolean;

  //warning message
  warning = null;

  //Array used for outputting history of operations.
  entries: object[];
  entr = {operand1: '', op: '', operand2: '', eq: '=', total: ''};


  /**
   * Initialize global variables
   * @param navCtrl 
   */
  constructor(public navCtrl: NavController) {
    this.lookingForNewInput = true;
    this.deletableDigits = false;
    this.entries = [];
  }

  /**
   * Registers and verifies digit inputs. Called when digit buttons
   * are clicked. Digits are passed in as strings to be appended to
   * the calculator's running input: inputFocus.
   * @param event - Research [fix]
   * @param item - The digit (passed in as string) that appended to inputFocus.
   */
  digitTapped(event, item) {
    if( item == '.' && /[.]/g.test(this.inputFocus) ){
        // Exit if '.' button is clicked multiple times.
        console.log('Already has decimal');
        return;
    }if(this.lookingForNewInput){
        // Execute if a new inputFocus is needed for a new operation.
        if(item == '.')
            this.inputFocus = '0' + item.toString();
        else
            this.inputFocus = item.toString();
        this.lookingForNewInput = false;
        this.deletableDigits = true;
        // Purpose: inputFocus is not automatically reset after
        // an operation is resolved for display purposes.
    }else{
        // If we have an existing inputFocus & more digits are clicked, append.
        this.inputFocus += item.toString();
    }
  }

  /**
   * Registers and verifies inputs consisting of operators. Called when 
   * operators: +, -, *, /, AC, +/- are clicked. When called verify 
   * that the input is valid: i.e. inputFocus possesses a value to serve
   * as the first operand. Please see use-cases for more details.
   * @param event 
   * @param item 
   */
  operatorTapped(event, item) {
      // If special input is registered, execute corresponding functions
      if(item == 'AC'){
          this.absoluteClear();
          return;
      }else if(item == '+/-'){
          this.changeSign();
          return;
      }

      // If operator is consistently clicked, update operator with new ones.
      if(this.lookingForNewInput == true && this.sum != null){
        this.operator1 = item;
        return;
      }

      // If 2 operands exist (sum & inputFocus are valid), and there is an
      // unresolved / queued operator, execute the operation as if 'equalsTapped()' was 
      // called.
      if(this.operator1 != null){
        let result = this.getTotal().toString();
        if(result == 'error')
            return;
        this.inputFocus = result;
        this.entries.unshift(this.entr);
      }

      // log the new operator & update variables to look for new inputs.
      this.sum = this.inputFocus;
      this.operator1 = item;
      this.lookingForNewInput = true;
      this.deletableDigits = false;
  }

  /**
   * Verifies whether the program is in a state to execute a valid operation.
   * If yes - executes operation by calling getTotal(), then resets variables to 
   * set up for new operations. Valid operations require an existing sum (operand1),
   * inputFocus(operand2) and operator1 (operator) to execute successfully.
   * @param event - [fix]
   */
  equalsTapped(event) {
      // function is called without a valid operator, display the current inputFocus
      // as the total, and reset state of the calculator.
      if(this.operator1 == null){
          this.lookingForNewInput = true;
          this.deletableDigits = false;
          this.sum = null;
          return this.inputFocus;
      }

      if(this.getTotal() == 'error')
        return;
      
      // Execute operation & reset variables.
      this.inputFocus = this.getTotal().toString();
      this.entries.unshift(this.entr);
      this.sum = null;
      this.operator1 = null;
      this.lookingForNewInput = true;
      this.deletableDigits = false;
  }

  /**
   * When backspace is tapped, verify that inputFocus is deletable (has digits to delete),
   * if so slice them or reset inputFocus entirely.
   * @param event 
   */
  deleteDigitTapped(event) {
      if(this.deletableDigits){
          if(this.inputFocus.length - 1 == 0 || this.inputFocus == '0.'){
              this.inputFocus = '0';
              this.lookingForNewInput = true;
              return;
          }
          this.inputFocus = this.inputFocus.slice(0, -1);
      }
  }

  /**
   * Resolves the operation consisting of the current sum, inputFocus, and operator1
   * values. These 3 variables respresent the operand1, operand2, and operator of the
   * operation. If errors are encountered log the error and reset calculator state.
   */
  getTotal(){
      if(this.sum != null){
          this.entr = {operand1: this.sum, op: this.operator1, operand2: this.inputFocus, 
            eq: '=', total: '10'};
      }
      let total = null;
      if(this.operator1 == '+')
        total =  Number(this.sum) + Number(this.inputFocus);
      else if(this.operator1 == '-')
        total =  Number(this.sum) - Number(this.inputFocus);
      else if(this.operator1 == '*')
        total = Number(this.sum) * Number(this.inputFocus);
      else if(this.operator1 == '/'){
        if(this.inputFocus == '0' || this.inputFocus == '0.0'){
            this.warning = 'Not A Number';
            this.absoluteClear();
            return 'error';
        }
        total = Number(this.sum) / Number(this.inputFocus);
      }else{
        // return same old stuff if '=' is repeatedly pressed.
        return this.inputFocus; 
      }
      this.entr.total = total.toString();
      return total;
  }

  /**
   * Resolves requests for changing the numeric sign of the inputFocus. The function is 
   * called from operatorTapped().
   */
  changeSign(){
    if(this.inputFocus.charAt(0) == '-')
        this.inputFocus = this.inputFocus.substring(1, this.inputFocus.length);
    else
        this.inputFocus = '-' + this.inputFocus;
        console.log(this.inputFocus);
  }

  /**
   * Clears both operands and operator (sum, inputFocus, operator1). Resets 
   * the state of the calculator.
   */
  absoluteClear(){
    this.inputFocus = '0';
    this.sum = null;
    this.operator1 = null;
    this.lookingForNewInput = true;
    this.deletableDigits = false;
    return;
  }

}
