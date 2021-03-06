#ifndef AST_STMT_H
#define AST_STMT_H 1

#include <memory>
#include <optional>
#include <set>
#include <string>
#include <vector>

#include "expr.h"
#include "scan/token.h"
#include "type.h"

class FragmentAST : public ASTNode
{
};

class StmtAST : public FragmentAST
{
};

class LabelStmtAST : public StmtAST
{
private:
	TokenIdentifier name;
	std::shared_ptr<StmtAST> stmt;
};

class CaseStmtAST : public StmtAST
{
private:
	std::shared_ptr<ExprAST> constant;
	std::shared_ptr<StmtAST> stmt;
};

class DefaultStmtAST : public StmtAST
{
private:
	std::shared_ptr<StmtAST> stmt;
};

class ExprStmtAST : public StmtAST
{
private:
	std::shared_ptr<ExprAST> expr;
};

class CompoundStmtAST : public StmtAST
{
protected:
	std::vector<FragmentAST> stmts;	 // have to statement or declaration
};

class IfStmtAST : public StmtAST
{
private:
	std::shared_ptr<ExprAST> condition;
	std::shared_ptr<StmtAST> if_body;
	std::shared_ptr<StmtAST> else_body;
};

class ForStmtAST : public StmtAST  // use for while?
{
private:
	std::shared_ptr<StmtAST> initializer;
	std::shared_ptr<ExprAST> condition;
	std::shared_ptr<StmtAST> increment;
	std::shared_ptr<StmtAST> body;
};

class DoWhileStmtAST : public StmtAST
{
private:
	enum DoWhileKind
	{
		do_,
		while_,
	} kind;
	std::shared_ptr<ExprAST> condition;
	std::shared_ptr<StmtAST> body;
};

class JumpStmtAST : public StmtAST
{
private:
	TokenIdentifier name;
};

class ContinueStmtAST : public StmtAST
{
};

class BreakStmtAST : public StmtAST
{
};

class ReturnStmtAST : public StmtAST
{
private:
	std::vector<std::shared_ptr<ExprAST>> expr;
};

class ExternAST : public FragmentAST
{
public:
	ExternAST(std::shared_ptr<TypeAST> type)
		: type(type)
	{
	}

protected:
	std::shared_ptr<TypeAST> type;
};

class FunctionDefinitionAST : public ExternAST
{
public:
	FunctionDefinitionAST(std::shared_ptr<FunctionTypeAST> type, std::shared_ptr<TokenIdentifier> name, std::shared_ptr<CompoundStmtAST> body)
		: ExternAST(type)
		, name(name)
		, body(body)
	{
	}

private:
	std::shared_ptr<TokenIdentifier> name;
	std::shared_ptr<CompoundStmtAST> body;
};

class DeclarationAST : public ExternAST
{
public:
	DeclarationAST(std::shared_ptr<TypeAST> type, std::vector<std::tuple<std::shared_ptr<TokenIdentifier>, std::shared_ptr<TypeAST>, std::shared_ptr<ExprAST>>> declarators = std::vector<std::tuple<std::shared_ptr<TokenIdentifier>, std::shared_ptr<TypeAST>, std::shared_ptr<ExprAST>>>())
		: ExternAST(type)
	{
	}

private:
	std::vector<std::tuple<std::shared_ptr<TokenIdentifier>, std::shared_ptr<TypeAST>, std::shared_ptr<ExprAST>>> declarators;
};

class Program
{
public:
	void add_declaration_stmt(std::shared_ptr<ExternAST> dcl_stmt);

private:
	std::vector<std::shared_ptr<ExternAST>> declarations;
};

#endif
