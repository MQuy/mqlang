#ifndef SCAN_LEXER_H
#define SCAN_LEXER_H 1

#include <functional>
#include <memory>
#include <stdexcept>
#include <unordered_map>

#include "token.h"

class Lexer
{
public:
	Lexer(std::string source)
		: source(source)
		, source_length(source.length())
		, tokens(std::make_shared<std::vector<std::shared_ptr<Token>>>())
		, current(0)
		, runner(0)
		, column(0)
		, row(0)
	{
	}

	std::shared_ptr<std::vector<std::shared_ptr<Token>>> scan();

private:
	std::shared_ptr<Token> scan_token();
	std::shared_ptr<Token> scan_character();
	std::shared_ptr<Token> scan_string();
	std::shared_ptr<Token> scan_number();
	std::shared_ptr<Token> scan_decimal();
	std::shared_ptr<Token> scan_hexadecimal();
	std::shared_ptr<Token> scan_octal();
	std::shared_ptr<Token> scan_binary();
	std::shared_ptr<Token> scan_decimal_or_hexa(std::function<bool(char)> comparator, char exponent, unsigned base);
	std::shared_ptr<Token> scan_binary_or_octal(std::function<bool(char)> comparator, long start, unsigned base);
	std::shared_ptr<Token> scan_whole_number_suffix(std::string number, unsigned base);
	std::shared_ptr<Token> scan_fractional_number_suffix(std::string number, unsigned base);
	std::shared_ptr<Token> scan_word();
	unsigned char scan_escape_sequences();

	void reset();
	void move_cursor(int distance);
	void new_line();
	void skip_spaces();
	bool look_ahead(char target);
	bool look_ahead(std::function<bool(char)> comparator);
	bool look_ahead_and_match(char ch);
	bool look_ahead_and_match(std::function<bool(char)> comparator);

	long current;
	long runner;
	unsigned column;
	unsigned row;
	std::string source;
	long source_length;
	std::shared_ptr<std::vector<std::shared_ptr<Token>>> tokens;
};

class UnexpectedToken : public std::runtime_error
{
public:
	UnexpectedToken(std::string message)
		: std::runtime_error(message)
	{
	}
};

class LexerError : public std::runtime_error
{
public:
	LexerError(std::string message)
		: std::runtime_error(message)
	{
	}
};

std::shared_ptr<std::unordered_map<std::string, TokenName>> init_keywords();

#endif
