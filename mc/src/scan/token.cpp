#include "token.h"

void Token::set_position(SourcePosition start_, SourcePosition end_)
{
	start = start_;
	end = end_;
}

TokenLiteral<int>::TokenLiteral(std::string text, unsigned base)
	: value(strtol(text.c_str(), nullptr, base))
	, Token(TokenType::tk_constant)
{
}

TokenLiteral<long>::TokenLiteral(std::string text, unsigned base)
	: value(strtol(text.c_str(), nullptr, base))
	, Token(TokenType::tk_constant)
{
}

TokenLiteral<long long>::TokenLiteral(std::string text, unsigned base)
	: value(strtoll(text.c_str(), nullptr, base))
	, Token(TokenType::tk_constant)
{
}

TokenLiteral<unsigned int>::TokenLiteral(std::string text, unsigned base)
	: value(strtoul(text.c_str(), nullptr, base))
	, Token(TokenType::tk_constant)
{
}

TokenLiteral<unsigned long>::TokenLiteral(std::string text, unsigned base)
	: value(strtoul(text.c_str(), nullptr, base))
	, Token(TokenType::tk_constant)
{
}

TokenLiteral<unsigned long long>::TokenLiteral(std::string text, unsigned base)
	: value(strtoull(text.c_str(), nullptr, base))
	, Token(TokenType::tk_constant)
{
}

TokenLiteral<float>::TokenLiteral(std::string text, unsigned base)
	: value(strtof(text.c_str(), nullptr))
	, Token(TokenType::tk_constant)
{
}

TokenLiteral<double>::TokenLiteral(std::string text, unsigned base)
	: value(strtod(text.c_str(), nullptr))
	, Token(TokenType::tk_constant)
{
}

TokenLiteral<long double>::TokenLiteral(std::string text, unsigned base)
	: value(strtold(text.c_str(), nullptr))
	, Token(TokenType::tk_constant)
{
}
