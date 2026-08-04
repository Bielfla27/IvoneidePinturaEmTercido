package br.com.gabrielfelix.ivoneide_pintura_api.order;

public class OrderNotFoundException extends RuntimeException {

	public OrderNotFoundException(Long id) {
		super("Pedido nao encontrado com id: " + id);
	}
}
