import { TType, Token } from "./token";
import * as AST from "./ast";

/**
 * program : PROGRAM variable SEMI block dot
 * block : declaration compound_statement
 * declaration : VAR (variable_declaration SEMI)+ | (procedure)* | empty
 * variable_declaration : variable (COMMA variable)* COLON typespec
 * typespec : INTEGER | REAL
 * procedure: PROCEDURE variable paramter SEMI block SEMI
 * parameter: LPAREN variable_declaration (SEMI variable_declaration)* RPAREN | empty
 * compound_statement : BEGIN statement (SEMI statement)* SEMI END
 * statement : compound_statement | assignment_statement
 * assignment_statement : variable ASSIGN expression
 * empty :
 * expression : term ((PLUS | MINUS) term)*
 * term : factor ((MUL | DIV) factor)*
 * factor : (PLUS | MINUS) expression | INTEGER_CONST | REAL_CONST | LPAREN expression RPAREN | variable
 * variable : ID
 */

export class Parser {
  tokens: Token[];
  cPointer: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.cPointer = 0;
  }

  execute() {
    return this.program();
  }

  eat(type: TType) {
    let token = this.tokens[this.cPointer];

    if (token.type === type) {
      this.cPointer += 1;
      return token;
    } else {
      throw new Error("Wrong syntax");
    }
  }

  program(): AST.ProgramNode {
    this.eat(TType.PROGRAM);
    let variableNode = this.variable();
    this.eat(TType.SEMI);
    let blockNode = this.block();
    this.eat(TType.DOT);
    return new AST.ProgramNode(variableNode.token.value.toString(), blockNode);
  }

  variable(): AST.TokenNode {
    let token = this.eat(TType.VARIABLE_NAME);

    return new AST.TokenNode(token);
  }

  block(): AST.BlockNode {
    let declarationNode = this.declaration();
    let compoundNode = this.compound();

    return new AST.BlockNode(declarationNode, compoundNode);
  }

  declaration(): AST.DeclarationNode {
    let varDeclarations: AST.VariableDeclarationNode[] = [];
    let procedures: AST.ProcedureNode[] = [];

    if (this.getCurrentToken().type === TType.VAR) {
      this.eat(TType.VAR);
      while (this.getCurrentToken().type === TType.VARIABLE_NAME) {
        let nodes = this.variableDeclaration();
        varDeclarations.push(...nodes);
        this.eat(TType.SEMI);
      }
    }

    while (this.getCurrentToken().type === TType.PROCEDURE) {
      let procedure = this.procedure();
      procedures.push(procedure);
    }

    return new AST.DeclarationNode(varDeclarations, procedures);
  }

  variableDeclaration(): AST.VariableDeclarationNode[] {
    let variableName = this.eat(TType.VARIABLE_NAME);
    let declarations = [new AST.TokenNode(variableName)];

    while (this.getCurrentToken().type === TType.COMMA) {
      this.eat(TType.COMMA);
      variableName = this.eat(TType.VARIABLE_NAME);
      declarations.push(new AST.TokenNode(variableName));
    }
    this.eat(TType.COLON);
    let type = this.type();
    return declarations.map(
      declaration => new AST.VariableDeclarationNode(declaration, type)
    );
  }

  procedure(): AST.ProcedureNode {
    this.eat(TType.PROCEDURE);
    let name = this.eat(TType.VARIABLE_NAME);
    let parameters: AST.VariableDeclarationNode[] = [];

    if (this.getCurrentToken().type === TType.LPAREN) {
      this.eat(TType.LPAREN);
      parameters = this.paramters();
      this.eat(TType.RPAREN);
    }
    this.eat(TType.SEMI);
    let block = this.block();
    this.eat(TType.SEMI);
    return new AST.ProcedureNode(name.value, parameters, block);
  }

  paramters() {
    let parameters: AST.VariableDeclarationNode[] = [];

    while (this.getCurrentToken().type === TType.VARIABLE_NAME) {
      parameters = [...parameters, ...this.variableDeclaration()];
    }
    return parameters;
  }

  type(): AST.TokenNode {
    let token = this.getCurrentToken();

    if (token.type === TType.INTEGER) {
      return new AST.TokenNode(this.eat(TType.INTEGER));
    } else if (token.type === TType.REAL) {
      return new AST.TokenNode(this.eat(TType.REAL));
    } else {
      throw new Error("Wrong syntax");
    }
  }

  compound(): AST.CompoundNode {
    this.eat(TType.BEGIN);
    let statement: AST.CompoundNode | AST.AssignmentNode;
    let statements: (AST.CompoundNode | AST.AssignmentNode)[] = [];

    while (true) {
      let token = this.getCurrentToken();

      if (token.type === TType.BEGIN) {
        statement = this.compound();
        statements.push(statement);
        this.eat(TType.SEMI);
      } else if (token.type === TType.VARIABLE_NAME) {
        statement = this.assignment();
        statements.push(statement);
        this.eat(TType.SEMI);
      } else if (token.type === TType.END) {
        this.eat(TType.END);
        break;
      }
    }
    return new AST.CompoundNode(statements);
  }

  statement(): AST.CompoundNode | AST.AssignmentNode {
    let token = this.getCurrentToken();

    if (token.type === TType.BEGIN) {
      return this.compound();
    } else if (token.type === TType.VARIABLE_NAME) {
      return this.assignment();
    } else {
      throw new Error("Wrong syntax");
    }
  }

  assignment(): AST.AssignmentNode {
    let variable = this.eat(TType.VARIABLE_NAME);
    this.eat(TType.ASSIGN);
    let expression = this.expression();

    return new AST.AssignmentNode(new AST.TokenNode(variable), expression);
  }

  expression(): AST.ExpressionNode | AST.UnaryNode | AST.TokenNode {
    let node = this.term();
    let token = this.getCurrentToken();

    while (token && (token.type === TType.PLUS || token.type === TType.MINUS)) {
      this.cPointer += 1;
      node = new AST.ExpressionNode(node, token, this.term());
      token = this.getCurrentToken();
    }

    return node;
  }

  term(): AST.ExpressionNode | AST.UnaryNode | AST.TokenNode {
    let node = this.factor();
    let token = this.getCurrentToken();

    while (token && (token.type === TType.MUL || token.type === TType.DIV)) {
      this.cPointer += 1;
      node = new AST.ExpressionNode(node, token, this.factor());
      token = this.getCurrentToken();
    }

    return node;
  }

  factor(): AST.ExpressionNode | AST.UnaryNode | AST.TokenNode {
    let token = this.getCurrentToken();

    if (token.type === TType.LPAREN) {
      this.eat(TType.LPAREN);
      const node = this.expression();
      this.eat(TType.RPAREN);
      return node;
    } else if (token.type === TType.PLUS) {
      this.eat(TType.PLUS);
      return new AST.UnaryNode(token, this.expression());
    } else if (token.type === TType.MINUS) {
      this.eat(TType.MINUS);
      return new AST.UnaryNode(token, this.expression());
    } else if (token.type === TType.REAL_CONST) {
      this.eat(TType.REAL_CONST);
      return new AST.TokenNode(token);
    } else if (token.type === TType.INTEGER_CONST) {
      this.eat(TType.INTEGER_CONST);
      return new AST.TokenNode(token);
    } else {
      return this.variable();
    }
  }

  getCurrentToken() {
    return this.tokens[this.cPointer];
  }
}
