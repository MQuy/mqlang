import { Lexer, Parser, Token, TokenType } from "../../src";
import { Program } from "../../src/ast/program";
import {
  ExpressionStatement,
  ParameterDeclaration,
} from "../../src/ast/statement";
import {
  BinaryExpression,
  VarExpression,
  LiteralExpression,
  GroupExpression,
  UnaryExpression,
  LogicalExpression,
  CallExpression,
  GetExpression,
  ArrayExpression,
  LambdaExpression,
  NewExpression,
} from "../../src/ast/expression";

it("multi over add", () => {
  const source = `x + def(y: String, z: Number): Boolean => 1; * 2.5;`;
  const tokens = new Lexer(source).scan();
  const program = new Parser(tokens).parse();

  expect(program).toEqual(
    new Program([
      new ExpressionStatement(
        new BinaryExpression(
          new VarExpression(new Token(TokenType.IDENTIFIER, "x", undefined, 1, 1)),
          new Token(TokenType.PLUS, "+", undefined, 1, 3),
          new BinaryExpression(
            new LambdaExpression(
              [
                new ParameterDeclaration(
                  new Token(TokenType.IDENTIFIER, "y", undefined, 1, 9),
                  "String",
                ),
                new ParameterDeclaration(
                  new Token(TokenType.IDENTIFIER, "z", undefined, 1, 20),
                  "Number",
                ),
              ],
              new ExpressionStatement(
                new LiteralExpression(
                  new Token(TokenType.NUMBER, "1", 1, 1, 43),
                  "Number",
                ),
              ),
              "Boolean",
            ),
            new Token(TokenType.STAR, "*", undefined, 1, 46),
            new LiteralExpression(
              new Token(TokenType.NUMBER, "2.5", 2.5, 1, 48),
              "Number",
            ),
          ),
        ),
      ),
    ]),
  );
});

it("group unary over multi", () => {
  const source = `(false - new Base()) / -2.5;`;
  const tokens = new Lexer(source).scan();
  const program = new Parser(tokens).parse();

  expect(program).toEqual(
    new Program([
      new ExpressionStatement(
        new BinaryExpression(
          new GroupExpression(
            new BinaryExpression(
              new LiteralExpression(
                new Token(TokenType.BOOLEAN, "false", false, 1, 2),
                "Boolean",
              ),
              new Token(TokenType.MINUS, "-", undefined, 1, 8),
              new NewExpression(
                new Token(TokenType.IDENTIFIER, "Base", undefined, 1, 14),
                [],
              ),
            ),
          ),
          new Token(TokenType.SLASH, "/", undefined, 1, 22),
          new UnaryExpression(
            new Token(TokenType.MINUS, "-", undefined, 1, 24),
            new LiteralExpression(
              new Token(TokenType.NUMBER, "2.5", 2.5, 1, 25),
              "Number",
            ),
          ),
        ),
      ),
    ]),
  );
});

it("get over logical", () => {
  const source = `x.y(1) and x > [1];`;
  const tokens = new Lexer(source).scan();
  const program = new Parser(tokens).parse();

  expect(program).toEqual(
    new Program([
      new ExpressionStatement(
        new LogicalExpression(
          new CallExpression(
            new GetExpression(
              new VarExpression(
                new Token(TokenType.IDENTIFIER, "x", undefined, 1, 1),
              ),
              new Token(TokenType.IDENTIFIER, "y", undefined, 1, 3),
            ),
            [
              new LiteralExpression(
                new Token(TokenType.NUMBER, "1", 1, 1, 5),
                "Number",
              ),
            ],
          ),
          new Token(TokenType.AND, "and", undefined, 1, 8),
          new LogicalExpression(
            new VarExpression(
              new Token(TokenType.IDENTIFIER, "x", undefined, 1, 12),
            ),
            new Token(TokenType.GREAT, ">", undefined, 1, 14),
            new ArrayExpression([
              new LiteralExpression(
                new Token(TokenType.NUMBER, "1", 1, 1, 17),
                "Number",
              ),
            ]),
          ),
        ),
      ),
    ]),
  );
});

it("missing operator", () => {
  const source = `x 1`;
  const tokens = new Lexer(source).scan();

  expect(() => new Parser(tokens).parse()).toThrow(
    new Error("Line 1:3 Expect ;"),
  );
});

it("missing ]", () => {
  const source = `[x;`;
  const tokens = new Lexer(source).scan();

  expect(() => new Parser(tokens).parse()).toThrow(
    new Error("Line 1:3 Expect expression"),
  );
});