package br.com.gabrielfelix.ivoneide_pintura_api.product;

public class ProductNotFoundException extends RuntimeException {

	public ProductNotFoundException(Long id) {
		super("Produto com id " + id + " não encontrado.");
	}
}
